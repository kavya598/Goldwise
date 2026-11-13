# GoldWise — Frontend Interface

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
