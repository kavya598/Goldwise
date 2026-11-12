"""
GoldWise — Completely Self-Contained Google Colab & Standalone Python Edition
=============================================================================
Upload this single file (`goldwise_colab.py`) to Google Colab and run:
    !python goldwise_colab.py

Dataset options supported automatically:
  1. Local `Data/` folder (e.g. `./Data` or `/content/Data` or `/content/GoldWise/Data`)
  2. Google Drive folder (`/content/drive/MyDrive/GoldWise/Data` or `/content/drive/MyDrive/Data`)
  3. Interactive ZIP upload in Google Colab (`Data.zip` or `GoldWise.zip`)

NOTE: Never hardcode API keys in this file. Set `GOLD_API_KEY` and `GEMINI_API_KEY`
via Colab Secrets (`google.colab.userdata`) or environment variables.
"""

from __future__ import annotations

import math
import os
import subprocess
import sys
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

# ── Dependency Check (auto-installs missing packages in Colab if needed) ──────
REQUIRED_PACKAGES = [
    ("pandas", "pandas"),
    ("numpy", "numpy"),
    ("requests", "requests"),
    ("yfinance", "yfinance"),
    ("sklearn", "scikit-learn"),
    ("matplotlib", "matplotlib"),
    ("seaborn", "seaborn"),
]

for mod_name, pkg_name in REQUIRED_PACKAGES:
    try:
        __import__(mod_name)
    except ImportError:
        print(f"[Setup] Installing {pkg_name}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg_name])

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import requests
import seaborn as sns
import yfinance as yf
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

# ── Constants & Environment Keys (No secrets hardcoded) ────────────────────────
RISK_FREE_RATE_DEFAULT = 0.065
TRADING_DAYS_PER_YEAR = 252
SGB_ANNUAL_COUPON_RATE = 0.025
SGB_COUPON_FREQUENCY = 2
TROY_OUNCE_TO_GRAMS = 31.1034768


def get_secret(key_name: str) -> str:
    val = os.getenv(key_name, "").strip()
    if val:
        return val
    try:
        from google.colab import userdata
        return str(userdata.get(key_name) or "").strip()
    except Exception:
        return ""


GOLD_API_KEY = get_secret("GOLD_API_KEY")
GEMINI_API_KEY = get_secret("GEMINI_API_KEY")


# ── Dataset Locator (Local, Google Drive, or Colab ZIP Upload) ─────────────────

def locate_data_dir() -> Optional[Path]:
    """Automatically locate the GoldWise `Data/` folder across Local, Drive, or Colab."""
    candidates = [
        Path.cwd() / "Data",
        Path("/content/Data"),
        Path("/content/GoldWise/Data"),
        Path("/content/GOLDWISE/Data"),
        Path("/content/drive/MyDrive/GoldWise/Data"),
        Path("/content/drive/MyDrive/GOLDWISE/Data"),
        Path("/content/drive/MyDrive/Data"),
    ]
    for p in candidates:
        if p.exists() and p.is_dir():
            return p

    # Try mounting Google Drive if running in Colab
    try:
        import google.colab  # noqa: F401
        from google.colab import drive, files
        drive_root = Path("/content/drive")
        if not drive_root.exists():
            print("[Colab] Data/ not found locally. Attempting Google Drive mount (or cancel to upload ZIP)...")
            try:
                drive.mount("/content/drive")
                for p in candidates:
                    if p.exists() and p.is_dir():
                        return p
            except Exception:
                pass

        print("[Colab] Please upload your `Data.zip` (or `GoldWise.zip`) file...")
        uploaded = files.upload()
        for fname in uploaded.keys():
            if fname.lower().endswith(".zip"):
                extract_dir = Path("/content/goldwise_uploaded")
                extract_dir.mkdir(parents=True, exist_ok=True)
                with zipfile.ZipFile(fname, "r") as zf:
                    zf.extractall(extract_dir)
                for sub in [extract_dir / "Data", extract_dir / "GoldWise" / "Data", extract_dir / "GOLDWISE" / "Data"]:
                    if sub.exists():
                        return sub
                for match in extract_dir.rglob("01_SGB_Data"):
                    return match.parent
    except ImportError:
        pass

    print("WARNING: Could not locate GoldWise `Data/` directory. Missing datasets will be skipped safely.")
    return None


# ── Domain Models ──────────────────────────────────────────────────────────────

class Product:
    def __init__(self, symbol: str, name: str, category: str, issuer: str, expense_ratio: float = 0.0, isin: str = ""):
        self.symbol = symbol.strip().upper()
        self.name = name.strip()
        self.category = category.strip().upper()
        self.issuer = issuer.strip()
        self.expense_ratio = float(expense_ratio or 0.0)
        self.isin = isin.strip()


class SGBProduct(Product):
    def __init__(self, symbol: str, name: str, tranche: str = "", nominal_price: float = 0.0,
                 issue_date: Optional[str] = None, maturity_date: Optional[str] = None,
                 gold_grams_per_unit: float = 1.0, liquidity_flag: str = "Normal"):
        super().__init__(symbol, name, "SGB", "Reserve Bank of India", 0.0)
        self.tranche = tranche
        self.nominal_price = float(nominal_price or 0.0)
        self.issue_date = issue_date
        self.maturity_date = maturity_date
        self.gold_grams_per_unit = float(gold_grams_per_unit or 1.0)
        self.liquidity_flag = liquidity_flag


class ETFProduct(Product):
    def __init__(self, symbol: str, name: str, amc: str, yfinance_ticker: str, expense_ratio: float = 0.5, aum_cr: float = 0.0):
        super().__init__(symbol, name, "ETF", amc, expense_ratio)
        self.yfinance_ticker = yfinance_ticker
        self.aum_cr = float(aum_cr or 0.0)


class FoFProduct(Product):
    def __init__(self, symbol: str, name: str, fund_house: str, scheme_code: str, expense_ratio: float = 0.25,
                 min_lumpsum: Optional[float] = None, min_sip: Optional[float] = None):
        super().__init__(symbol, name, "FOF", fund_house, expense_ratio)
        self.scheme_code = str(scheme_code)
        self.min_lumpsum = min_lumpsum
        self.min_sip = min_sip


# ── Financial Calculations ─────────────────────────────────────────────────────

def calculate_absolute_return(p_start: float, p_end: float) -> Optional[float]:
    if not p_start or p_start <= 0 or p_end is None:
        return None
    return round(((p_end / p_start) - 1.0) * 100.0, 2)


def calculate_cagr(p_start: float, p_end: float, elapsed_days: float) -> Optional[float]:
    if not p_start or not p_end or p_start <= 0 or p_end <= 0 or not elapsed_days or elapsed_days < 30:
        return None
    years = elapsed_days / 365.25
    return round((((p_end / p_start) ** (1.0 / years)) - 1.0) * 100.0, 2)


def calculate_daily_returns(series: pd.Series) -> pd.Series:
    s = series.dropna()
    s = s[s > 0]
    return s.pct_change().dropna() if len(s) >= 2 else pd.Series(dtype=float)


def calculate_annualized_volatility(daily_rets: pd.Series) -> Optional[float]:
    if daily_rets is None or len(daily_rets) < 5:
        return None
    sd = float(np.std(daily_rets, ddof=1))
    return round(sd * math.sqrt(TRADING_DAYS_PER_YEAR) * 100.0, 2) if not math.isnan(sd) else None


def calculate_maximum_drawdown(series: pd.Series) -> Optional[float]:
    s = series.dropna()
    s = s[s > 0]
    if len(s) < 2:
        return None
    dd = (s - s.cummax()) / s.cummax()
    return round(float(dd.min()) * 100.0, 2)


def calculate_sharpe_ratio(cagr_pct: Optional[float], vol_pct: Optional[float], rf: float = RISK_FREE_RATE_DEFAULT) -> Optional[float]:
    if cagr_pct is None or vol_pct is None or vol_pct <= 0.001:
        return None
    return round(((cagr_pct / 100.0) - rf) / (vol_pct / 100.0), 2)


def calculate_xirr(cash_flows: List[Tuple[date, float]], guess: float = 0.10) -> Optional[float]:
    if len(cash_flows) < 2:
        return None
    d0 = cash_flows[0][0]
    rate = guess
    for _ in range(100):
        rate = max(-0.999, rate)
        npv = sum(cf / ((1.0 + rate) ** ((dt - d0).days / 365.25)) for dt, cf in cash_flows)
        deriv = sum(-((dt - d0).days / 365.25) * cf / ((1.0 + rate) ** (((dt - d0).days / 365.25) + 1.0)) for dt, cf in cash_flows)
        if abs(npv) < 1e-5:
            return round(rate * 100.0, 2)
        if abs(deriv) < 1e-10:
            break
        new_rate = rate - (npv / deriv)
        if abs(new_rate - rate) < 1e-5:
            return round(new_rate * 100.0, 2)
        rate = new_rate
    return None


def calculate_sgb_indicative_valuation(gold_price_per_gram: Optional[float], market_price: Optional[float], gold_grams_per_unit: float = 1.0) -> Dict[str, Any]:
    if not gold_price_per_gram or gold_price_per_gram <= 0:
        return {"estimated_gold_value": None, "market_price": market_price, "premium_discount_pct": None}
    est = round(gold_price_per_gram * gold_grams_per_unit, 2)
    prem = round(((market_price - est) / est) * 100.0, 2) if (market_price and market_price > 0) else None
    return {
        "estimated_gold_value": est,
        "market_price": round(market_price, 2) if market_price else None,
        "premium_discount_pct": prem,
        "label": "Indicative gold-linked valuation only — NOT an exchange price or guaranteed RBI redemption value.",
    }


def run_future_projection(mode: str, amount: float, years: int, expected_return_pct: float = 10.0) -> Dict[str, Any]:
    rates = {"conservative": max(2.0, expected_return_pct - 3.0), "base": expected_return_pct, "optimistic": expected_return_pct + 3.0}
    total_inv = round(amount * years * 12, 2) if mode == "sip" else round(amount, 2)

    def fv(r_pct: float, t: int) -> float:
        r = r_pct / 100.0
        if mode == "sip":
            rm, n = r / 12.0, t * 12
            return amount * (((1.0 + rm) ** n - 1.0) / rm) * (1.0 + rm)
        return amount * ((1.0 + r) ** t)

    return {
        "mode": mode,
        "total_invested": total_inv,
        "scenarios": {k: {"rate_pct": v, "estimated_value": round(fv(v, years), 2)} for k, v in rates.items()},
        "disclaimer": "Hypothetical constant-return scenarios, not guaranteed returns.",
    }


# ── Standalone GoldWise Engine (CSV Load + API-First Refresh) ──────────────────

class GoldWiseColabEngine:
    def __init__(self, data_dir: Optional[Path]):
        self.data_dir = data_dir
        self.products: Dict[str, Product] = {}
        self.price_series: Dict[str, pd.Series] = {}
        self.benchmark_series: pd.Series = pd.Series(dtype=float)
        self.status_panel: Dict[str, Dict[str, Any]] = {}

    def load_csvs(self):
        if self.data_dir is None:
            print("WARNING: No Data directory supplied. Skipping CSV load.")
            return

        # 1. Benchmark
        for rel in ["04_Gold_Benchmark/Gold_Benchmark_Extended_2021_2026.csv", "04_Gold_Benchmark/Gold_Benchmark_Historical_2023_2026.csv"]:
            p = self.data_dir / rel
            if p.exists():
                df = pd.read_csv(p)
                dc = next((c for c in df.columns if "date" in c.lower()), "Date")
                pc = next((c for c in df.columns if "gram" in c.lower() or "price" in c.lower() or "close" in c.lower()), df.columns[1])
                df[dc] = pd.to_datetime(df[dc], errors="coerce")
                df[pc] = pd.to_numeric(df[pc], errors="coerce")
                df = df.dropna(subset=[dc, pc])
                df = df[df[pc] > 0].sort_values(by=dc)
                self.benchmark_series = pd.Series(df[pc].values, index=df[dc], name="BENCHMARK")
                self.price_series["BENCHMARK"] = self.benchmark_series
                break

        # 2. SGBs
        sgb_p = self.data_dir / "01_SGB_Data/SGB_Active_Historical_Matched.csv"
        if sgb_p.exists():
            df = pd.read_csv(sgb_p, low_memory=False)
            for sym in df["SYMBOL"].dropna().unique():
                sub = df[df["SYMBOL"] == sym].copy()
                sub["DATE1"] = pd.to_datetime(sub["DATE1"], errors="coerce")
                sub["CLOSE_PRICE"] = pd.to_numeric(sub["CLOSE_PRICE"], errors="coerce")
                sub = sub.dropna(subset=["DATE1", "CLOSE_PRICE"])
                sub = sub[sub["CLOSE_PRICE"] > 0].sort_values(by="DATE1")
                if len(sub) < 5:
                    continue
                r0 = sub.iloc[0]
                self.products[sym] = SGBProduct(
                    symbol=sym, name=f"SGB {r0.get('Tranche / Series', sym)}",
                    nominal_price=float(r0.get("Nominal Issue Price (₹)", 0.0) or 0.0),
                    issue_date=str(r0.get("Issue Date", ""))[:10],
                    maturity_date=str(r0.get("Maturity Date", ""))[:10],
                )
                self.price_series[sym] = pd.Series(sub["CLOSE_PRICE"].values, index=sub["DATE1"], name=sym)

        # 3. ETFs
        etf_p = self.data_dir / "02_ETF_Data/ETF_Historical_Data.csv"
        if etf_p.exists():
            df = pd.read_csv(etf_p)
            for tk in df["Ticker"].dropna().unique():
                sub = df[df["Ticker"] == tk].copy()
                sub["Date"] = pd.to_datetime(sub["Date"], errors="coerce")
                sub["Close"] = pd.to_numeric(sub["Close"], errors="coerce")
                sub = sub.dropna(subset=["Date", "Close"])
                sub = sub[sub["Close"] > 0].sort_values(by="Date")
                if len(sub) < 5:
                    continue
                sym = tk.replace(".NS", "").replace(".BO", "")
                s = pd.Series(sub["Close"].values, index=sub["Date"], name=sym)
                for sp_dt in s.pct_change()[(s.pct_change() <= -0.985) & (s.pct_change() >= -0.995)].index:
                    if len(s[s.index >= sp_dt]) > 3:
                        s.loc[s.index < sp_dt] = s.loc[s.index < sp_dt] / 100.0
                self.products[sym] = ETFProduct(sym, str(sub.iloc[0].get("Scheme_Name", sym)), "AMC", tk)
                self.price_series[sym] = s

        # 4. FoFs
        fof_p = self.data_dir / "03_FOF_Data/FoF_Historical_NAV_All.csv"
        if fof_p.exists():
            df = pd.read_csv(fof_p)
            sc = "Master_Scheme" if "Master_Scheme" in df.columns else "Scheme_Name"
            for sn in df[sc].dropna().unique():
                sub = df[df[sc] == sn].copy()
                sub["Date"] = pd.to_datetime(sub["Date"], errors="coerce")
                sub["NAV"] = pd.to_numeric(sub["NAV"], errors="coerce")
                sub = sub.dropna(subset=["Date", "NAV"])
                sub = sub[sub["NAV"] > 0].sort_values(by="Date")
                if len(sub) < 5:
                    continue
                sym = sn.replace(" ", "_").replace("-", "_")[:20].upper()
                self.products[sym] = FoFProduct(sym, sn, str(sub.iloc[0].get("Fund_House", "AMC")), str(sub.iloc[0].get("Scheme_Code", "")))
                self.price_series[sym] = pd.Series(sub["NAV"].values, index=sub["Date"], name=sym)

        print(f"[GoldWise Colab] Loaded {len(self.products)} products | Benchmark rows: {len(self.benchmark_series)}")

    def refresh_apis_with_fallback(self):
        # Benchmark: GoldAPI -> CSV Fallback
        bench_status = "CSV FALLBACK"
        bench_price = float(self.benchmark_series.iloc[-1]) if not self.benchmark_series.empty else None
        if GOLD_API_KEY:
            try:
                r = requests.get("https://www.goldapi.io/api/XAU/INR", headers={"x-access-token": GOLD_API_KEY}, timeout=6)
                if r.status_code == 200:
                    p = float(r.json().get("price_gram_24k") or (r.json().get("price", 0) / TROY_OUNCE_TO_GRAMS))
                    if math.isfinite(p) and p > 0:
                        bench_price, bench_status = round(p, 2), "API LIVE (GoldAPI)"
            except Exception:
                pass
        self.status_panel["benchmark"] = {"status": bench_status, "latest_price": bench_price}

        # FoFs: MFAPI -> CSV Fallback
        fof_ok = 0
        fofs = [p for p in self.products.values() if isinstance(p, FoFProduct) and p.scheme_code]
        for p in fofs[:5]:
            try:
                r = requests.get(f"https://api.mfapi.in/mf/{p.scheme_code}/latest", timeout=4)
                if r.status_code == 200 and r.json().get("data"):
                    fof_ok += 1
            except Exception:
                pass
        self.status_panel["fof"] = {"status": f"LATEST NAV ({fof_ok}/5 probed)" if fof_ok > 0 else "CSV FALLBACK"}

    def plot_summary_charts(self):
        if self.benchmark_series.empty:
            print("WARNING: Benchmark series missing; skipping chart.")
            return
        sns.set_style("whitegrid")
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))

        # Chart 1: Gold Benchmark
        b1y = self.benchmark_series[self.benchmark_series.index >= (self.benchmark_series.index[-1] - timedelta(days=365))]
        axes[0].plot(b1y.index, b1y.values, color="#987000", linewidth=2)
        axes[0].fill_between(b1y.index, b1y.values, b1y.min(), color="#F5D28A", alpha=0.3)
        axes[0].set_title("Gold Benchmark (INR / Gram) — 1Y")
        axes[0].set_ylabel("INR / g")

        # Chart 2: Growth of 100 Comparison
        for sym, color in [("GOLDBEES", "#987000"), ("HDFCGOLD", "#16845B"), ("SGBAPR28I", "#24272B")]:
            s = self.price_series.get(sym)
            if s is not None and not s.empty:
                s1y = s[s.index >= (s.index[-1] - timedelta(days=365))]
                norm = (s1y / s1y.iloc[0]) * 100.0
                axes[1].plot(norm.index, norm.values, label=sym, linewidth=1.8, color=color)
        axes[1].set_title("Growth of ₹100 — 1Y Comparison")
        axes[1].legend()
        plt.tight_layout()
        plt.show()


def main():
    data_dir = locate_data_dir()
    engine = GoldWiseColabEngine(data_dir)
    engine.load_csvs()
    engine.refresh_apis_with_fallback()

    print("\n--- Data-Source Status ---")
    print(engine.status_panel)

    # Sample SGB Gold-Linked Valuation
    gold_px = engine.status_panel.get("benchmark", {}).get("latest_price")
    sgbs = [p for p in engine.products.values() if isinstance(p, SGBProduct)]
    if sgbs and gold_px:
        s0 = sgbs[0]
        mkt = float(engine.price_series[s0.symbol].iloc[-1])
        val = calculate_sgb_indicative_valuation(gold_px, mkt, s0.gold_grams_per_unit)
        print(f"\n--- SGB Indicative Valuation ({s0.symbol}) ---")
        print(val)

    # Sample Future Projection
    print("\n--- Future 5Y Monthly SIP (₹5,000 @ 10% Base) ---")
    print(run_future_projection("sip", 5000.0, 5, 10.0))

    if "ipykernel" in sys.modules:
        engine.plot_summary_charts()


if __name__ == "__main__":
    main()
