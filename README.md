# GoldWise — Gold Investment Intelligence Platform

GoldWise is a financial analytics and decision-support platform for Indian retail gold investors covering **Sovereign Gold Bonds (SGBs)**, **Gold ETFs**, and **Gold Fund of Funds (FoFs)**.

---

## 1. Local Setup & Execution

### Prerequisites
- Python 3.10+
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### Configure API Keys
Copy `.env.example` to `.env` and add your keys (never commit `.env`):
```env
GOLD_API_KEY=your_goldapi_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```
- **GoldAPI** (`GOLD_API_KEY`): Optional for live XAU/INR spot price (free tier: 150 requests/month). If omitted or unavailable, GoldWise automatically falls back to `Data/04_Gold_Benchmark/`.
- **Gemini API** (`GEMINI_API_KEY`): Optional for the Ask AI narrative layer. Deterministic guardrails and tool fallbacks remain active without it.
- **Yahoo Finance (`yfinance`) & MFAPI (`api.mfapi.in`)**: No API key required.

### Run Locally
```bash
python run.py
```
Open **http://127.0.0.1:8000** in your browser.

### Run Automated Tests
```bash
pytest tests/ -v
```

---

## 2. Running in Google Colab (`goldwise_colab.py`)

`goldwise_colab.py` is a **single, completely self-contained Python file** for Google Colab.

1. Open a new notebook in [Google Colab](https://colab.research.google.com/).
2. Upload **`goldwise_colab.py`** to the Colab session (Files sidebar → Upload).
3. Supply your `Data/` folder using **either** method:
   - **Option A (ZIP Upload):** Zip your `Data/` folder as `Data.zip` and upload it when prompted (or upload it to `/content/`).
   - **Option B (Google Drive):** Place the `Data/` folder at `MyDrive/GoldWise/Data/` in Google Drive; the script will mount Drive and locate it automatically.
4. *(Optional)* Add `GOLD_API_KEY` and `GEMINI_API_KEY` in Colab **Secrets** (key icon in the left sidebar).
5. Run in a Colab cell:
   ```python
   !python goldwise_colab.py
   ```
   Or import and call `engine.plot_summary_charts()` inside a notebook cell to render Matplotlib/Seaborn charts inline.
