import os
import shutil

# 1. Create directories
os.makedirs('backend_only', exist_ok=True)
os.makedirs('frontend/html', exist_ok=True)
os.makedirs('vercel_deploy/api', exist_ok=True)
os.makedirs('extra', exist_ok=True)

# 2. Setup backend_only
shutil.copyfile('app/backend.py', 'backend_only/backend.py')

run_backend_content = """# GoldWise — Standalone Backend API Server
import uvicorn
from backend import app

if __name__ == '__main__':
    print('=' * 65)
    print('Starting GoldWise Backend API Server...')
    print('API Docs available at: http://127.0.0.1:8000/docs')
    print('Benchmark Endpoint   : http://127.0.0.1:8000/api/benchmark')
    print('=' * 65)
    uvicorn.run(app, host='127.0.0.1', port=8000)
"""
with open('backend_only/run_backend.py', 'w', encoding='utf-8') as f:
    f.write(run_backend_content)

shutil.copyfile('requirements.txt', 'backend_only/requirements.txt')

backend_readme = """# GoldWise — Standalone Backend API

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
"""
with open('backend_only/README.md', 'w', encoding='utf-8') as f:
    f.write(backend_readme)

# 3. Setup frontend/html/
shutil.copyfile('frontend/index.html', 'frontend/html/index.html')

frontend_readme = """# GoldWise — Frontend Interface

This directory contains the user interface components of the GoldWise platform, cleanly separated into HTML, CSS, and JavaScript.

## Directory Structure
- `index.html`: Main single-page application entry point (served at root `/`).
- `html/`: Dedicated directory containing the structured HTML templates.
  - `index.html`: Complete semantic HTML5 markup and modals.
- `css/`: Dedicated stylesheet directory.
  - `styles.css`: Complete styling supporting both **Warm Champagne Porcelain Light Mode** and **Obsidian Gold Dark Mode**.
- `js/`: Modular JavaScript controllers.
  - `app.js`: Core controller, tab navigation, theme management, and API client.
  - `overview.js`: Market overview dashboard and interactive Plotly benchmark chart.
  - `explorer.js`: Product explorer table, multi-criteria filters, and modal inspector.
  - `compare.js`: Multi-asset comparative analytics and normalized growth curves.
  - `simulator.js`: Lump-sum and monthly SIP future wealth projection calculator.
  - `shortlist.js`: Rule-based asset screening and shortlisting engine.
  - `assistant.js`: Interactive AI Investment Assistant chat interface with safety guardrails.
"""
with open('frontend/README.md', 'w', encoding='utf-8') as f:
    f.write(frontend_readme)

# 4. Setup vercel_deploy
shutil.copyfile('vercel.json', 'vercel_deploy/vercel.json')
shutil.copyfile('api/index.py', 'vercel_deploy/api/index.py')
shutil.copyfile('requirements.txt', 'vercel_deploy/requirements.txt')

vercel_readme = """# GoldWise — Vercel Deployment Package

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
"""
with open('vercel_deploy/README.md', 'w', encoding='utf-8') as f:
    f.write(vercel_readme)

# 5. Move extra files into extra/
extra_files = [
    'build_full_report.py',
    'make_monolith.py',
    'push_to_github.py',
    'goldwise_colab.py',
    'BBA_Semester_5_Python_Project_Guidelines.pdf',
    'goldwise_assistant_brief.md',
    'goldwise_option_a_complete.md',
    'PROJECT_STRUCTURE.md',
    'GoldWise_Source_Code.zip'
]

for ef in extra_files:
    if os.path.exists(ef):
        dest = os.path.join('extra', ef)
        if os.path.exists(dest):
            os.remove(dest)
        shutil.move(ef, dest)
        print(f'Moved to extra/: {ef}')

# Copy report_assets into extra/report_assets if needed
if os.path.exists('report_assets') and not os.path.exists('extra/report_assets'):
    shutil.copytree('report_assets', 'extra/report_assets')
    print('Copied report_assets/ into extra/report_assets/')

extra_readme = """# GoldWise — Extra & Auxiliary Resources

This directory contains auxiliary scripts, project briefs, build tools, and reference documentation that support the GoldWise platform.

## Directory Contents
- `build_full_report.py`: Automated generator script for the 15-section TAPMI Academic Project Report in Microsoft Word (.docx) format.
- `make_monolith.py`: Generator script that bundles frontend and backend into `goldwise_all_in_one.py`.
- `push_to_github.py`: Git automation script utilizing Dulwich.
- `goldwise_colab.py`: Standalone single-file Google Colab script with automated dependency installation.
- `BBA_Semester_5_Python_Project_Guidelines.pdf`: Official TAPMI BBAH Semester 5 project guidelines.
- `goldwise_assistant_brief.md`: Technical design brief for the AI assistant module.
- `goldwise_option_a_complete.md`: Full Option A Computational Thinking specification.
- `PROJECT_STRUCTURE.md`: Architectural overview document.
- `GoldWise_Source_Code.zip`: Complete zip archive of all source files and datasets.
- `report_assets/`: High-resolution (300 DPI) publication figures and UI screenshots.
"""
with open('extra/README.md', 'w', encoding='utf-8') as f:
    f.write(extra_readme)

print("Folder organization successfully executed!")
