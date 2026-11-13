# GoldWise — Vercel Deployment Package

This directory contains configuration files for deploying GoldWise to Vercel.

## Contents
- `vercel.json`: Routing and serverless function build configuration.
- `api/index.py`: Serverless ASGI application handler for Vercel.
- `requirements.txt`: Python packages required for the cloud deployment.

## Deployment Instructions
1. Import repository into Vercel via GitHub: `https://github.com/kavya598/Goldwise`
2. Root Directory: `./` (or `vercel_deploy`)
3. Framework Preset: `Other`
4. Environment Variables:
   - `GOLD_API_KEY`: (Optional) Your GoldAPI key
   - `GEMINI_API_KEY`: (Optional) Your Gemini API key
