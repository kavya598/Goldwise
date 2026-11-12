"""
GoldWise Quick Launcher
Starts the FastAPI backend and serves the Emerald & Gold frontend.
"""

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("  Starting GoldWise — Gold Investment Intelligence Platform")
    print("  Open in your browser: http://127.0.0.1:8000")
    print("=" * 60)
    uvicorn.run("app.backend:app", host="127.0.0.1", port=8000, reload=False)
