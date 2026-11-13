# GoldWise — Standalone Backend API

This directory contains only the backend components of the GoldWise platform.

## Contents
- `backend.py`: Consolidated Python backend containing domain models, 31+ financial math calculations, DataLoaderService, DataProviderService (API-first with CSV fallback), and FastAPI REST endpoints.
- `run_backend.py`: Standalone server runner.
- `requirements.txt`: Python package dependencies.

## How to Run
```bash
pip install -r requirements.txt
python run_backend.py
```
Interactive Swagger API documentation will be available at:
`http://127.0.0.1:8000/docs`
