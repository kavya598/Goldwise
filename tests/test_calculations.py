"""
Unit Tests for GoldWise Analytical & Financial Engine
Covers all 31 backend calculations, domain models, and syllabus concepts.
"""

import pytest
import pandas as pd
import numpy as np
from datetime import date, datetime

from app.backend import (
    calculate_absolute_return,
    calculate_cagr,
    calculate_daily_returns,
    calculate_annualized_volatility,
    calculate_maximum_drawdown,
    calculate_sharpe_ratio,
    calculate_rolling_volatility,
    calculate_tracking_difference,
    calculate_tracking_error,
    calculate_correlation,
    calculate_normalized_growth,
    calculate_rolling_returns,
    run_lump_sum_simulation,
    run_sip_simulation,
    calculate_xirr,
    run_future_projection,
    classify_risk_profile,
    evaluate_shortlist,
    calculate_sgb_coupons,
    calculate_sgb_total_return,
    calculate_sgb_redemption_and_maturity,
    check_and_clean_price_series,
    detect_price_outliers,
    align_common_periods,
    recursive_binary_search_date,
    quicksort_products_by_metric,
    SGBProduct,
    ETFProduct,
    FoFProduct,
)


# --- 1. Core Financial Metrics Tests ---

def test_absolute_return():
    assert calculate_absolute_return(100.0, 150.0) == 50.0
    assert calculate_absolute_return(100.0, 80.0) == -20.0
    assert calculate_absolute_return(0, 100) is None


def test_cagr_exact_elapsed_days():
    # Exactly 2 years (730.5 days), doubled from 100 to 200
    # CAGR = (200/100)^(1/2) - 1 = 1.4142 - 1 = 41.42%
    cagr = calculate_cagr(100.0, 200.0, elapsed_days=730.5)
    assert cagr == pytest.approx(41.42, 0.05)


def test_daily_returns_and_volatility():
    prices = pd.Series([100.0, 102.0, 101.0, 103.0, 105.0, 104.0, 106.0])
    rets = calculate_daily_returns(prices)
    assert len(rets) == 6
    vol = calculate_annualized_volatility(rets)
    assert vol is not None
    assert vol > 0.0


def test_maximum_drawdown_negative_percentage():
    # Peak at 120, drops to 90 -> (90 - 120)/120 = -25%
    prices = pd.Series([100.0, 120.0, 110.0, 90.0, 105.0])
    mdd = calculate_maximum_drawdown(prices)
    assert mdd == -25.0


def test_sharpe_ratio():
    # Return 18.5%, Risk-free 6.5%, Vol 12% -> (0.185 - 0.065) / 0.12 = 1.0
    sharpe = calculate_sharpe_ratio(18.5, 12.0, risk_free_rate=0.065)
    assert sharpe == 1.0


# --- 2. Comparison & Tracking Tests ---

def test_tracking_difference_and_error():
    td = calculate_tracking_difference(24.5, 22.0)
    assert td == 2.5

    dates = pd.date_range("2024-01-01", periods=30, freq="B")
    p_rets = pd.Series(np.random.normal(0.001, 0.01, 30), index=dates)
    b_rets = pd.Series(np.random.normal(0.001, 0.01, 30), index=dates)

    te = calculate_tracking_error(p_rets, b_rets)
    assert te is not None
    assert te >= 0.0


def test_normalized_growth():
    prices = pd.Series([50.0, 55.0, 60.0])
    norm = calculate_normalized_growth(prices, base_value=100.0)
    assert list(norm) == [100.0, 110.0, 120.0]


# --- 3. Simulator & XIRR Tests ---

def test_lump_sum_simulation():
    dates = pd.date_range("2023-01-01", periods=100, freq="D")
    prices = pd.Series(np.linspace(100, 150, 100), index=dates)
    res = run_lump_sum_simulation(prices, investment_amount=10000.0)

    assert res["total_invested"] == 10000.0
    assert res["ending_value"] == 15000.0
    assert res["gain_loss"] == 5000.0
    assert res["absolute_return_pct"] == 50.0


def test_xirr_calculation():
    # Invest -100 on Jan 1, receive +110 exactly 1 year later -> XIRR = 10%
    cf = [
        (date(2023, 1, 1), -100.0),
        (date(2024, 1, 1), 110.0)
    ]
    xirr = calculate_xirr(cf)
    assert xirr == pytest.approx(10.0, 0.1)


# --- 4. SGB Engine & Distinction Tests ---

def test_sgb_coupons_and_total_return():
    # Issue price 5000, 2.5% p.a. -> Semi-annual payout = 62.50 per unit
    coupons = calculate_sgb_coupons(
        nominal_issue_price=5000.0,
        issue_date_str="2020-04-28",
        holding_end_date_str="2021-04-28",
        units=2.0
    )
    assert coupons["semi_annual_payout_per_unit"] == 62.50
    assert coupons["coupons_paid_count"] == 2
    assert coupons["cumulative_coupon_income"] == 250.0

    # Total return vs Price-only
    res = calculate_sgb_total_return(
        purchase_price=5000.0,
        current_price=6000.0,
        nominal_issue_price=5000.0,
        issue_date_str="2020-04-28",
        exit_date_str="2021-04-28",
        units=1.0
    )
    assert res["price_return_pct"] == 20.0
    assert res["total_return_pct"] == pytest.approx(22.5, 0.1)


def test_sgb_maturity_and_redemption_eligibility():
    res = calculate_sgb_redemption_and_maturity(
        issue_date_str="2018-05-01",
        maturity_date_str="2026-05-01",
        current_date_str="2024-06-01"
    )
    # Elapsed > 5 years, so early redemption should be eligible
    assert res["early_redemption_eligible"] is True
    assert res["is_matured"] is False


# --- 5. Risk Profiler & Data Processing ---

def test_risk_classification():
    low = classify_risk_profile(10.5, -8.0)
    assert low["tier"] == "Low"

    med = classify_risk_profile(15.0, -18.0)
    assert med["tier"] == "Medium"

    high = classify_risk_profile(22.0, -30.0)
    assert high["tier"] == "High"


def test_data_cleaning_no_synthetic_fill():
    raw_df = pd.DataFrame({
        "Date": ["2024-01-01", "2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"],
        "Close": [100.0, 100.0, -5.0, None, 105.0]
    })
    clean, report = check_and_clean_price_series(raw_df)
    assert report["duplicate_dates_removed"] == 1
    assert report["negative_or_zero_prices"] == 1
    assert report["missing_prices"] == 1
    assert len(clean) == 2


# --- 6. Classes & Polymorphism Tests ---

def test_product_polymorphism():
    sgb = SGBProduct("SGBMAY28", "SGB Series I", nominal_price=5000.0, issue_date="2020-05-01")
    etf = ETFProduct("GOLDBEES", "Nippon Gold ETF", "Nippon", "GOLDBEES.NS", average_volume=500000)
    fof = FoFProduct("HDFC_FOF", "HDFC Gold FoF", "HDFC AMC", "119062")

    assert sgb.category == "SGB"
    assert sgb.expense_ratio == 0.0
    assert etf.is_liquid() is True
    assert "Daily NAV" in fof.get_liquidity_profile()


# --- 7. Recursive Binary Search & Quicksort ---

def test_recursive_search_and_quicksort():
    dates = ["2024-01-02", "2024-01-04", "2024-01-08", "2024-01-10"]
    # Target falls on weekend 2024-01-06 -> should return 2024-01-08
    matched = recursive_binary_search_date(dates, "2024-01-06")
    assert matched == "2024-01-08"

    items = [{"symbol": "A", "val": 10}, {"symbol": "B", "val": 30}, {"symbol": "C", "val": 20}]
    sorted_items = quicksort_products_by_metric(items, "val", reverse=True)
    assert [x["symbol"] for x in sorted_items] == ["B", "C", "A"]


# --- 8. Future Projection & Decision Engine Guardrails ---

def test_future_projection_sip_and_lumpsum():
    sip_res = run_future_projection(mode="sip", amount=5000.0, years=5, expected_return_pct=12.0)
    assert sip_res["total_invested"] == 300000.0
    assert sip_res["scenarios"]["base"]["estimated_value"] > 300000.0
    assert sip_res["scenarios"]["optimistic"]["estimated_value"] > sip_res["scenarios"]["base"]["estimated_value"]
    assert sip_res["scenarios"]["base"]["estimated_value"] > sip_res["scenarios"]["conservative"]["estimated_value"]

    ls_res = run_future_projection(mode="lump_sum", amount=100000.0, years=3, expected_return_pct=10.0)
    assert ls_res["total_invested"] == 100000.0
    assert ls_res["scenarios"]["base"]["estimated_value"] == pytest.approx(133100.0, 1.0)


def test_shortlist_excludes_unknown_risk_and_missing_cagr():
    products = [
        {"symbol": "GOOD", "name": "Good ETF", "category": "ETF", "cagr": 18.0, "volatility": 12.0, "max_drawdown": -9.0, "expense_ratio": 0.5, "risk_tier": "Medium", "is_liquid": True},
        {"symbol": "NEW_FOF", "name": "New FoF", "category": "FOF", "cagr": None, "volatility": None, "max_drawdown": None, "expense_ratio": 0.2, "risk_tier": "Unknown", "coverage_note": "Launched 6 months ago"}
    ]
    res = evaluate_shortlist(products, horizon_years=3.0, liquidity_need="Moderate", risk_tolerance="Medium", preferred_category="ALL")
    shortlisted_syms = [x["symbol"] for x in res["shortlist"]]
    excluded_syms = [x["symbol"] for x in res["excluded"]]
    assert "GOOD" in shortlisted_syms
    assert "NEW_FOF" not in shortlisted_syms
    assert "NEW_FOF" in excluded_syms
