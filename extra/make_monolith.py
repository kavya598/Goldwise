import os
import base64
from pathlib import Path

frontend_files = [
    'frontend/index.html',
    'frontend/css/styles.css',
    'frontend/js/app.js',
    'frontend/js/overview.js',
    'frontend/js/explorer.js',
    'frontend/js/compare.js',
    'frontend/js/simulator.js',
    'frontend/js/shortlist.js',
    'frontend/js/assistant.js'
]

encoded_assets = {}
for fpath in frontend_files:
    with open(fpath, 'rb') as fp:
        encoded_assets[fpath] = base64.b64encode(fp.read()).decode('ascii')

with open('app/backend.py', 'r', encoding='utf-8') as fp:
    backend_code = fp.read()

# Strip any __future__ import from backend_code to avoid duplicate or misplaced import
backend_code_cleaned = []
for line in backend_code.splitlines():
    if 'from __future__ import annotations' in line:
        continue
    backend_code_cleaned.append(line)
backend_clean = '\n'.join(backend_code_cleaned)

header = '''from __future__ import annotations
"""
GoldWise — Single-File Executable Full-Stack Application (goldwise_all_in_one.py)
================================================================================
Contains the ENTIRE frontend (HTML, CSS, JS) and backend (FastAPI, 31+ Calculations,
DataProvider, Gemini Assistant) embedded in one standalone Python file.

To run:
    python goldwise_all_in_one.py
Then open your browser at:
    http://127.0.0.1:8000
"""

import base64
import os
from pathlib import Path

# Embedded Frontend Assets
EMBEDDED_FRONTEND = {
'''

parts = [header]
for fpath, b64 in encoded_assets.items():
    parts.append(f'    "{fpath}": "{b64}",\n')

unpack_logic = '''
}

def ensure_frontend_unpacked():
    for rel_path, b64_data in EMBEDDED_FRONTEND.items():
        target = Path(rel_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.stat().st_size == 0:
            target.write_bytes(base64.b64decode(b64_data.encode('ascii')))

ensure_frontend_unpacked()

'''
parts.append(unpack_logic)
parts.append(backend_clean)

runner = '''

if __name__ == '__main__':
    import uvicorn
    print('=' * 70)
    print('Starting GoldWise Full-Stack Monolithic Server...')
    print('Open in browser: http://127.0.0.1:8000')
    print('=' * 70)
    uvicorn.run(app, host='127.0.0.1', port=8000)
'''
parts.append(runner)

full_content = ''.join(parts)
with open('goldwise_all_in_one.py', 'w', encoding='utf-8') as fp:
    fp.write(full_content)

print(f"Generated goldwise_all_in_one.py: {os.path.getsize('goldwise_all_in_one.py')} bytes, {len(full_content.splitlines())} lines")
