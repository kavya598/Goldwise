# GoldWise — Gold Investment Intelligence Platform

GoldWise is an institutional-grade, full-stack quantitative financial analytics and decision-support platform designed for Indian retail gold investors, wealth managers, and advisors. It benchmarks **Sovereign Gold Bonds (SGBs)**, **Gold ETFs**, and **Gold Funds of Funds (FoFs)** against domestic 24K physical spot gold benchmarks.

---

## 📁 Repository Directory Structure

The project has been organized into modular packages separating the full-stack system, backend-only API server, standalone frontend, Vercel cloud deployment package, and auxiliary files:

```
GoldWise/
│
├── 📂 app/                     # CORE BACKEND ENGINE
│   ├── backend.py             # Domain models, 31+ financial metrics, DataProvider, Gemini AI, FastAPI routes
│   └── main.py                # ASGI application factory
│
├── 📂 frontend/                # FRONTEND USER INTERFACE (HTML, CSS, JS Separated)
│   ├── index.html             # Single-page application entry point
│   ├── README.md              # Frontend documentation
│   ├── 📂 html/               # Dedicated HTML templates directory
│   │   └── index.html         # Semantic HTML5 markup and modals
│   ├── 📂 css/                # Stylesheets directory
│   │   └── styles.css         # Warm Champagne Light & Obsidian Gold Dark themes
│   └── 📂 js/                 # Modular JavaScript controllers
│       ├── app.js             # Core router, state, theme manager, API client
│       ├── overview.js        # Overview dashboard & Plotly benchmark chart
│       ├── explorer.js        # Product explorer, filters, dynamic table & inspection modal
│       ├── compare.js         # Multi-asset comparative analytics & growth curves
│       ├── simulator.js       # Lump-sum & SIP future wealth simulator
│       ├── shortlist.js       # Multi-criteria asset screening engine
│       └── assistant.js       # AI Investment Assistant chat interface
│
├── 📂 backend_only/            # STANDALONE BACKEND PACKAGE (Independent API Server)
│   ├── backend.py             # Complete backend code
│   ├── run_backend.py         # Dedicated API runner (`python run_backend.py`)
│   ├── requirements.txt       # Backend dependencies
│   └── README.md              # Backend guide & Swagger docs reference
│
├── 📂 vercel_deploy/           # VERCEL CLOUD DEPLOYMENT PACKAGE
│   ├── vercel.json            # Vercel serverless routing configuration
│   ├── requirements.txt       # Deployment dependencies
│   ├── README.md              # Step-by-step Vercel deployment guide
│   └── 📂 api/                # Serverless function handlers
│       └── index.py           # Vercel ASGI serverless entry point
│
├── 📂 Data/                    # FINANCIAL DATASETS (Historical 2021–2026)
│   ├── 01_SGB_Data/           # 67 SGB tranches, secondary trade bhavcopy, coupon master
│   ├── 02_ETF_Data/           # 14 NSE Gold ETFs OHLCV and NAVs
│   ├── 03_FOF_Data/           # 11 AMFI Gold FoF daily historical NAVs
│   └── 04_Gold_Benchmark/     # 24K pure spot gold benchmark daily time series
│
├── 📂 tests/                   # AUTOMATED TEST SUITE (34/34 Tests Passing)
│   ├── test_calculations.py   # 16 financial formula and math validation tests
│   ├── test_data_provider.py  # 11 data loader, API fallback & zero-synthetic-fill tests
│   └── test_assistant.py      # 7 safety, prompt defense & grounding tests
│
├── 📂 extra/                   # AUXILIARY & EXTRA SCRIPTS, TOOLS AND BRIEFS
│   ├── build_full_report.py   # Academic Word report builder script
│   ├── make_monolith.py       # Monolith generator script
│   ├── push_to_github.py      # Git automation script
│   ├── organize_folders.py    # Directory organization utility
│   ├── goldwise_colab.py      # Standalone single-file Google Colab script
│   ├── BBA_Semester_5_Python_Project_Guidelines.pdf # TAPMI Guidelines
│   ├── goldwise_assistant_brief.md # AI assistant specification brief
│   ├── goldwise_option_a_complete.md # Option A complete specifications
│   ├── PROJECT_STRUCTURE.md   # Architectural overview document
│   ├── GoldWise_Source_Code.zip # Source code and datasets ZIP archive
│   ├── 📂 report_assets/      # 300 DPI publication figures & UI screenshots
│   └── README.md              # Description of extra utilities
│
├── GoldWise_Project_Report.docx # Complete academic project report (Times New Roman, 15 sections)
├── GoldWise_Complete_Codebase.txt # All-in-one text compilation (7,530 lines across all 17 files)
├── goldwise_all_in_one.py      # Single-file runnable monolithic full-stack app
├── run.py                      # Root full-stack server runner (`python run.py`)
├── requirements.txt            # Root dependencies
├── vercel.json                 # Root Vercel config (ensures instant deployment from GitHub)
├── api/                        # Root Vercel API entry
│   └── index.py
└── .env.example                # Environment variable template
```

---

## 🚀 Execution Modes

### 1. Run Full-Stack Application (Frontend + Backend)
```bash
pip install -r requirements.txt
python run.py
```
Open **http://127.0.0.1:8000** in your web browser.

### 2. Run Single-File Executable Monolith (`goldwise_all_in_one.py`)
Contains the entire frontend (HTML, CSS, JS) and backend (FastAPI, 31+ calculations) embedded into one single file:
```bash
python goldwise_all_in_one.py
```
Open **http://127.0.0.1:8000** in your browser.

### 3. Run Backend-Only API Server
To run only the backend API server without requiring frontend assets:
```bash
cd backend_only
pip install -r requirements.txt
python run_backend.py
```
API Documentation (Swagger UI) is available at: **http://127.0.0.1:8000/docs**

### 4. Deploy to Vercel
This repository is configured for one-click deployment on Vercel:
1. Connect your GitHub repository (`kavya598/Goldwise`) to [Vercel](https://vercel.com).
2. Framework Preset: **Other**.
3. Root Directory: `./`.
4. Deploy!

### 5. Run Automated Test Suite
```bash
pytest tests/ -v
```
All **34 automated tests** validate financial formulas, zero-synthetic-fill data cleaning, fallback mechanisms, and AI guardrails with 100% pass compliance.
