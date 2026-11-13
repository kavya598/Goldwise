# GoldWise — Project Structure

```text
GOLDWISE/
│
├── app/
│   └── backend.py                  # Consolidated single-file Python backend:
│                                   #   - Config, .env loading & theme tokens
│                                   #   - Product domain models (SGB, ETF, FoF)
│                                   #   - 31+ financial calculations (CAGR, Vol, MDD, Sharpe, XIRR, etc.)
│                                   #   - SGB gold-linked indicative valuation
│                                   #   - API-first data provider + automatic CSV fallback
│                                   #   - Gemini Research Assistant (structured JSON & grounding)
│                                   #   - FastAPI app & all /api/* endpoints
│
├── frontend/
│   ├── index.html                  # Single-page dashboard (Overview, Explorer, Compare, Simulator, Shortlist, Ask AI)
│   ├── css/
│   │   └── styles.css              # Warm Ivory, Champagne & Antique Gold design system + Dark Mode
│   └── js/
│       ├── app.js                  # Navigation, theme toggle, Refresh Data & Data-Source Status modal
│       ├── overview.js             # Benchmark KPI, 1D time / multi-year chart, dynamic performers
│       ├── explorer.js             # Filterable catalog, FoF SIP rules, SGB gold-linked valuation & 1D modal
│       ├── compare.js              # Common-period Growth of ₹100 comparison & takeaway
│       ├── simulator.js            # Historical Backtester & Future Investment Planner
│       ├── shortlist.js            # Constraint-based scoring & missing-data guardrails
│       └── assistant.js            # Structured Research Assistant chat UI
│
├── Data/
│   ├── 01_SGB_Data/                # Audited SGB master & NSE Bhavcopy historical prices
│   ├── 02_ETF_Data/                # 16 Gold ETF historical OHLCV, TER & liquidity audits
│   ├── 03_FOF_Data/                # 15 Gold FoF AMFI historical NAVs & scheme metadata
│   ├── 04_Gold_Benchmark/          # Gold INR/gram benchmark (2021–2026)
│   └── 05_Macroeconomic_Data/      # Macroeconomic reference datasets
│
├── tests/
│   ├── test_calculations.py        # Unit tests for core metrics, XIRR, SGB engine, future planner & shortlist
│   ├── test_data_provider.py       # 10 API-first / CSV-fallback resilience tests + SGB valuation test
│   └── test_assistant.py           # Acceptance tests for assistant guardrails & number grounding
│
├── goldwise_colab.py               # Self-contained single-file Google Colab edition
├── run.py                          # Local launcher (`python run.py`)
├── requirements.txt                # Python dependencies
├── .env.example                    # Template for GOLD_API_KEY & GEMINI_API_KEY
├── .gitignore                      # Excludes .env, __pycache__, .pytest_cache
├── README.md                       # Local & Google Colab instructions
└── PROJECT_STRUCTURE.md            # This file
```
