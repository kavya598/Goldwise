"""
Unit Tests for API-First Data Provider with Automatic CSV Fallback
and Gold-Linked SGB Indicative Valuation.
Covers all 10 required resilience scenarios without hitting external networks.
"""

from unittest.mock import patch, MagicMock
import pandas as pd
import requests
import pytest

from app.backend import (
    DataProviderService,
    data_loader,
    calculate_sgb_indicative_valuation,
)


def _make_mock_response(status_code=200, json_data=None):
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data if json_data is not None else {}
    return resp


def test_1_api_works_valid_data_benchmark():
    dp = DataProviderService()
    with patch("app.backend.fetch_latest_goldapi_spot") as mock_spot:
        mock_spot.return_value = {
            "status": "success",
            "price_inr_per_gram": 12500.50,
            "prev_close_inr_per_gram": 12400.00,
            "change_inr": 100.50,
            "change_pct": 0.81,
            "timestamp": "2026-11-12 13:00 IST",
            "price_status": "Live",
        }
        res = dp.refresh_benchmark()
        assert res["status"] == "API LIVE"
        assert res["is_fallback"] is False
        assert res["latest_price"] == 12500.50


def test_2_api_unavailable_csv_fallback():
    dp = DataProviderService()
    with patch("app.backend.fetch_latest_goldapi_spot") as mock_spot:
        mock_spot.return_value = {"status": "fallback", "error": "ConnectionError"}
        res = dp.refresh_benchmark()
        assert res["status"] == "CSV FALLBACK"
        assert res["is_fallback"] is True
        assert res["latest_price"] > 0
        assert res["observation_date"] is not None


def test_3_api_timeout_fof_fallback():
    dp = DataProviderService()
    with patch("app.backend.requests.get", side_effect=requests.Timeout("Timed out")):
        res = dp.refresh_fofs()
        assert res["status"] == "CSV FALLBACK"
        assert res["is_fallback"] is True
        assert res["observation_date"] is not None


def test_4_api_empty_response_fof_fallback():
    dp = DataProviderService()
    with patch("app.backend.requests.get", return_value=_make_mock_response(200, {})):
        res = dp.refresh_fofs()
        assert res["status"] == "CSV FALLBACK"
        assert res["is_fallback"] is True


def test_5_api_invalid_prices_rejected():
    assert DataProviderService.is_valid_price(-100) is False
    assert DataProviderService.is_valid_price(0) is False
    assert DataProviderService.is_valid_price(float("nan")) is False
    assert DataProviderService.is_valid_price("not_a_number") is False
    assert DataProviderService.is_valid_price(7500.25) is True

    dp = DataProviderService()
    with patch("app.backend.fetch_latest_goldapi_spot") as mock_spot:
        mock_spot.return_value = {"status": "success", "price_inr_per_gram": -50.0}
        res = dp.refresh_benchmark()
        assert res["status"] == "CSV FALLBACK"
        assert res["latest_price"] > 0


def test_6_duplicate_observations_not_duplicated():
    series_map = {
        "TEST_SYM": pd.Series([100.0, 102.0], index=pd.to_datetime(["2026-11-10", "2026-11-11"]), name="TEST_SYM")
    }
    # Attempt to append duplicate date
    appended_dup = DataProviderService.append_observation(series_map, "TEST_SYM", pd.Timestamp("2026-11-11"), 999.0)
    assert appended_dup is False
    assert len(series_map["TEST_SYM"]) == 2
    assert float(series_map["TEST_SYM"].iloc[-1]) == 102.0  # Existing preserved

    # Append genuinely new date
    appended_new = DataProviderService.append_observation(series_map, "TEST_SYM", pd.Timestamp("2026-11-12"), 105.0)
    assert appended_new is True
    assert len(series_map["TEST_SYM"]) == 3
    assert float(series_map["TEST_SYM"].iloc[-1]) == 105.0


def test_7_and_8_csv_fallback_and_both_unavailable():
    dp = DataProviderService()
    orig_bench = data_loader.benchmark_series
    try:
        data_loader.benchmark_series = pd.Series(dtype=float)
        with patch("app.backend.fetch_latest_goldapi_spot") as mock_spot:
            mock_spot.return_value = {"status": "error", "error": "Network down"}
            res = dp.refresh_benchmark()
            assert res["status"] == "UNAVAILABLE"
            assert res["latest_price"] is None
    finally:
        data_loader.benchmark_series = orig_bench


def test_9_market_closed_etf_last_available():
    dp = DataProviderService()
    # Mock yfinance returning a prior trading day (market closed today)
    dates = pd.to_datetime(["2026-11-09", "2026-11-10"])
    cols = pd.MultiIndex.from_product([["GOLDBEES.NS"], ["Open", "High", "Low", "Close", "Volume"]])
    mock_df = pd.DataFrame([[100.0, 102.0, 99.0, 101.5, 500000], [101.5, 103.0, 101.0, 102.5, 600000]], index=dates, columns=cols)

    with patch("app.backend.yf.download", return_value=mock_df):
        res = dp.refresh_etfs()
        assert res["status"] == "API DELAYED"
        assert res["is_fallback"] is False
        assert res["observation_date"] == "2026-11-10"
        assert "Market closed" in (res["error"] or "")


def test_10_fof_nav_not_yet_published_today():
    dp = DataProviderService()
    # MFAPI returns yesterday's NAV date (no duplicate, actual NAV date shown)
    mock_payload = {"data": [{"date": "11-11-2026", "nav": "35.4210"}], "status": "SUCCESS"}
    with patch("app.backend.requests.get", return_value=_make_mock_response(200, mock_payload)):
        res = dp.refresh_fofs()
        assert res["status"] == "LATEST NAV"
        assert res["observation_date"] == "2026-11-11"
        assert "not yet published" in (res["error"] or "")


def test_11_sgb_gold_linked_indicative_valuation():
    # Gold = 12,000/g, 1g per unit -> Estimated Value = 12,000
    # Market Price = 12,600 -> Premium = +5.0%
    val = calculate_sgb_indicative_valuation(
        gold_price_per_gram=12000.0,
        gold_grams_per_unit=1.0,
        market_price=12600.0,
        benchmark_source="GoldAPI (XAU/INR)",
        benchmark_timestamp="2026-11-12 13:00:00",
        market_status="CSV FALLBACK"
    )
    assert val["estimated_gold_value"] == 12000.0
    assert val["market_price"] == 12600.0
    assert val["premium_discount_pct"] == 5.0
    assert "Indicative" in val["valuation_label"]

    # When gold benchmark updates to 13,000/g -> Discount
    val2 = calculate_sgb_indicative_valuation(
        gold_price_per_gram=13000.0,
        gold_grams_per_unit=1.0,
        market_price=12600.0,
        benchmark_source="GoldAPI (XAU/INR)",
        benchmark_timestamp="2026-11-12 13:15:00",
        market_status="CSV FALLBACK"
    )
    assert val2["estimated_gold_value"] == 13000.0
    assert val2["premium_discount_pct"] < 0
