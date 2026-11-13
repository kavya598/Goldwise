# GoldWise — Standalone Backend API Server
import uvicorn
from backend import app

if __name__ == '__main__':
    print('=' * 65)
    print('Starting GoldWise Backend API Server...')
    print('API Docs available at: http://127.0.0.1:8000/docs')
    print('Benchmark Endpoint   : http://127.0.0.1:8000/api/benchmark')
    print('=' * 65)
    uvicorn.run(app, host='127.0.0.1', port=8000)
