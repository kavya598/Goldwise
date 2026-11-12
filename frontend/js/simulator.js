/**
 * Investment Simulator Module
 */

let cachedSimResult = null;
let cachedFutureResult = null;

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('tabActivated', async (e) => {
    if (e.detail.tab === 'simulator') {
      await populateSimulatorDropdowns();
    }
  });

  // Mode switcher: Historical Backtesting vs Future Investment Planner
  const simTabs = document.querySelectorAll('#sim-tab-switcher .period-pill');
  simTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      simTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.getAttribute('data-simview');
      const isFuture = view === 'future';
      document.getElementById('sim-historical-panel').style.display = isFuture ? 'none' : 'grid';
      document.getElementById('sim-future-panel').style.display = isFuture ? 'grid' : 'none';
      document.getElementById('sim-mode-desc').textContent = isFuture
        ? 'Estimate potential future corpus under Conservative, Base, and Optimistic return assumptions.'
        : 'Test how a past lump-sum or SIP investment actually performed using historical prices.';
      if (isFuture && !cachedFutureResult) {
        runFuturePlanner();
      }
    });
  });

  document.getElementById('sim-product')?.addEventListener('change', (e) => {
    updateDateBounds(e.target.value);
  });

  document.getElementById('sim-mode')?.addEventListener('change', (e) => {
    const isSip = e.target.value === 'sip';
    document.getElementById('sim-amount-label').textContent = isSip ? 'Monthly SIP Amount (₹)' : 'Lump-Sum Amount (₹)';
    document.getElementById('sim-kpi-rate-label').textContent = isSip ? 'XIRR' : 'CAGR';
    if (isSip && document.getElementById('sim-amount').value == 50000) {
      document.getElementById('sim-amount').value = 5000;
    } else if (!isSip && document.getElementById('sim-amount').value == 5000) {
      document.getElementById('sim-amount').value = 50000;
    }
  });

  document.getElementById('fut-mode')?.addEventListener('change', (e) => {
    const isSip = e.target.value === 'sip';
    document.getElementById('fut-amount-label').textContent = isSip ? 'Monthly SIP Amount (₹)' : 'Lump-Sum Amount (₹)';
    if (isSip && document.getElementById('fut-amount').value == 50000) {
      document.getElementById('fut-amount').value = 5000;
    } else if (!isSip && document.getElementById('fut-amount').value == 5000) {
      document.getElementById('fut-amount').value = 50000;
    }
  });

  document.getElementById('btn-run-sim')?.addEventListener('click', runSimulation);
  document.getElementById('btn-run-future')?.addEventListener('click', runFuturePlanner);

  window.addEventListener('themeChanged', () => {
    if (cachedSimResult && AppState.currentTab === 'simulator') {
      renderSimulatorChart(cachedSimResult);
    }
    if (cachedFutureResult && AppState.currentTab === 'simulator') {
      renderFutureChart(cachedFutureResult);
    }
  });
});

async function populateSimulatorDropdowns() {
  const prodSelect = document.getElementById('sim-product');
  const compSelect = document.getElementById('sim-compare');

  if (prodSelect.options.length > 0) return;

  if (!AppState.allProducts || AppState.allProducts.length === 0) {
    try {
      const res = await fetch('/api/explorer?period=1Y');
      const data = await res.json();
      AppState.allProducts = data.products;
    } catch (e) {
      return;
    }
  }

  const futSelect = document.getElementById('fut-product');
  AppState.allProducts.forEach(p => {
    const opt1 = document.createElement('option');
    opt1.value = p.symbol;
    opt1.textContent = `${p.symbol} — ${p.name} (${p.category})`;
    prodSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = p.symbol;
    opt2.textContent = `${p.symbol} (${p.category})`;
    compSelect.appendChild(opt2);

    if (futSelect) {
      const opt3 = document.createElement('option');
      opt3.value = p.symbol;
      opt3.textContent = `${p.symbol} — ${p.name} (${p.category})`;
      futSelect.appendChild(opt3);
    }
  });

  // Default to GOLDBEES if present
  if (Array.from(prodSelect.options).some(o => o.value === 'GOLDBEES')) {
    prodSelect.value = 'GOLDBEES';
  }
  await updateDateBounds(prodSelect.value);
  runSimulation();
}

async function updateDateBounds(symbol) {
  if (!symbol) return;
  try {
    const res = await fetch(`/api/product/${symbol}/dates`);
    const data = await res.json();
    const startInput = document.getElementById('sim-start-date');
    const endInput = document.getElementById('sim-end-date');
    startInput.min = data.min_date;
    startInput.max = data.max_date;
    endInput.min = data.min_date;
    endInput.max = data.max_date;

    // Default to 3 years back or min_date
    const maxDt = new Date(data.max_date);
    const threeYrAgo = new Date(maxDt);
    threeYrAgo.setFullYear(maxDt.getFullYear() - 3);
    const minDt = new Date(data.min_date);

    startInput.value = (threeYrAgo > minDt ? threeYrAgo : minDt).toISOString().split('T')[0];
    endInput.value = data.max_date;
  } catch (e) {
    console.error('Date bounds error:', e);
  }
}

async function runSimulation() {
  const symbol = document.getElementById('sim-product').value;
  const mode = document.getElementById('sim-mode').value;
  const amount = parseFloat(document.getElementById('sim-amount').value);
  const startDate = document.getElementById('sim-start-date').value;
  const endDate = document.getElementById('sim-end-date').value;
  const compareSymbol = document.getElementById('sim-compare').value;

  if (!symbol || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid product and positive amount.');
    return;
  }

  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        amount,
        start_date: startDate,
        end_date: endDate,
        mode,
        compare_symbol: compareSymbol
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.detail || 'Simulation failed');
      return;
    }

    cachedSimResult = data;
    const p = data.primary;

    document.getElementById('sim-kpi-invested').textContent = `₹${p.total_invested.toLocaleString('en-IN')}`;
    document.getElementById('sim-kpi-ending').textContent = `₹${p.ending_value.toLocaleString('en-IN')}`;

    const gainEl = document.getElementById('sim-kpi-gain');
    gainEl.textContent = `${p.gain_loss >= 0 ? '+' : '-'}₹${Math.abs(p.gain_loss).toLocaleString('en-IN')} (${p.absolute_return_pct}%)`;
    gainEl.className = 'kpi-value ' + (p.gain_loss >= 0 ? 'val-up' : 'val-down');

    const rateVal = mode === 'sip' ? p.xirr_pct : p.cagr_pct;
    document.getElementById('sim-kpi-rate').textContent = rateVal !== null ? `${rateVal}%` : 'N/A';

    renderSimulatorChart(data);
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

function renderSimulatorChart(data) {
  const styles = getComputedStyle(document.documentElement);
  const goldColor = styles.getPropertyValue('--primary').trim();
  const textColor = styles.getPropertyValue('--text-muted').trim();
  const primaryText = styles.getPropertyValue('--text').trim();
  const cardBg = styles.getPropertyValue('--card-bg').trim();
  const gridColor = styles.getPropertyValue('--chart-grid').trim();

  const p = data.primary;
  const traces = [{
    x: p.trajectory.map(pt => pt.date),
    y: p.trajectory.map(pt => pt.value),
    name: p.symbol,
    type: 'scatter',
    mode: 'lines',
    line: { color: goldColor, width: 2.5 },
    hovertemplate: '₹%{y:,.0f}<extra></extra>'
  }];

  if (data.comparison) {
    const c = data.comparison;
    traces.push({
      x: c.trajectory.map(pt => pt.date),
      y: c.trajectory.map(pt => pt.value),
      name: c.product_name,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#4C9A91', width: 2, dash: 'dot' },
      hovertemplate: '₹%{y:,.0f}<extra></extra>'
    });
  }

  const layout = {
    margin: { t: 14, r: 16, b: 30, l: 65 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    legend: { orientation: 'h', y: 1.12, font: { color: textColor, size: 11, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } },
    hoverlabel: {
      bgcolor: cardBg,
      bordercolor: goldColor,
      font: { color: primaryText, size: 12, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
    },
    xaxis: { showgrid: false, color: textColor, tickfont: { size: 11, color: textColor, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } },
    yaxis: { gridcolor: gridColor, color: textColor, tickprefix: '₹', tickfont: { size: 11, color: textColor, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } },
    hovermode: 'x unified'
  };

  Plotly.newPlot('sim-chart', traces, layout, { responsive: true, displayModeBar: false });
}

async function runFuturePlanner() {
  const symbol = document.getElementById('fut-product')?.value || '';
  const mode = document.getElementById('fut-mode')?.value || 'sip';
  const amount = parseFloat(document.getElementById('fut-amount')?.value || '5000');
  const years = parseInt(document.getElementById('fut-years')?.value || '5', 10);
  const expectedReturn = parseFloat(document.getElementById('fut-return')?.value || '10');

  if (isNaN(amount) || amount <= 0 || isNaN(expectedReturn) || expectedReturn <= 0) {
    alert('Please enter valid positive amount and expected return.');
    return;
  }

  try {
    const res = await fetch('/api/simulate/future', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: symbol || null,
        mode,
        amount,
        years,
        expected_return_pct: expectedReturn
      })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail || 'Projection failed');
      return;
    }

    cachedFutureResult = data;
    const sc = data.scenarios;

    document.getElementById('fut-kpi-invested').textContent = `₹${Math.round(data.total_invested).toLocaleString('en-IN')}`;
    document.getElementById('fut-kpi-duration').textContent = `${years} Years (${mode === 'sip' ? 'Monthly SIP' : 'Lump-Sum'})`;

    document.getElementById('fut-lbl-cons').textContent = `Conservative (${sc.conservative.assumed_return_pct}%)`;
    document.getElementById('fut-kpi-cons').textContent = `₹${Math.round(sc.conservative.estimated_value).toLocaleString('en-IN')}`;
    document.getElementById('fut-gain-cons').textContent = `Est. gain: +₹${Math.round(sc.conservative.estimated_gain).toLocaleString('en-IN')}`;

    document.getElementById('fut-lbl-base').textContent = `Base Case (${sc.base.assumed_return_pct}%)`;
    document.getElementById('fut-kpi-base').textContent = `₹${Math.round(sc.base.estimated_value).toLocaleString('en-IN')}`;
    document.getElementById('fut-gain-base').textContent = `Est. gain: +₹${Math.round(sc.base.estimated_gain).toLocaleString('en-IN')}`;

    document.getElementById('fut-lbl-opt').textContent = `Optimistic (${sc.optimistic.assumed_return_pct}%)`;
    document.getElementById('fut-kpi-opt').textContent = `₹${Math.round(sc.optimistic.estimated_value).toLocaleString('en-IN')}`;
    document.getElementById('fut-gain-opt').textContent = `Est. gain: +₹${Math.round(sc.optimistic.estimated_gain).toLocaleString('en-IN')}`;

    renderFutureChart(data);
  } catch (err) {
    console.error('Future planner error:', err);
  }
}

function renderFutureChart(data) {
  const styles = getComputedStyle(document.documentElement);
  const goldColor = styles.getPropertyValue('--primary').trim();
  const textColor = styles.getPropertyValue('--text-muted').trim();
  const primaryText = styles.getPropertyValue('--text').trim();
  const cardBg = styles.getPropertyValue('--card-bg').trim();
  const gridColor = styles.getPropertyValue('--chart-grid').trim();

  const x = data.trajectory.map(t => t.label);
  const traces = [
    {
      x, y: data.trajectory.map(t => t.optimistic),
      name: `Optimistic (${data.scenarios.optimistic.assumed_return_pct}%)`,
      type: 'scatter', mode: 'lines+markers',
      line: { color: '#56D6A4', width: 2, dash: 'dot' }
    },
    {
      x, y: data.trajectory.map(t => t.base),
      name: `Base Case (${data.scenarios.base.assumed_return_pct}%)`,
      type: 'scatter', mode: 'lines+markers',
      line: { color: goldColor, width: 2.8 }
    },
    {
      x, y: data.trajectory.map(t => t.conservative),
      name: `Conservative (${data.scenarios.conservative.assumed_return_pct}%)`,
      type: 'scatter', mode: 'lines+markers',
      line: { color: '#4C9A91', width: 2, dash: 'dash' }
    },
    {
      x, y: data.trajectory.map(t => t.invested),
      name: 'Total Invested',
      type: 'scatter', mode: 'lines',
      line: { color: textColor, width: 1.5 }
    }
  ];

  const layout = {
    margin: { t: 14, r: 16, b: 30, l: 70 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    legend: { orientation: 'h', y: 1.15, font: { color: textColor, size: 11, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } },
    hoverlabel: {
      bgcolor: cardBg,
      bordercolor: goldColor,
      font: { color: primaryText, size: 12, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
    },
    xaxis: { showgrid: false, color: textColor, tickfont: { size: 11, color: textColor, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } },
    yaxis: { gridcolor: gridColor, color: textColor, tickprefix: '₹', tickfont: { size: 11, color: textColor, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } },
    hovermode: 'x unified'
  };

  Plotly.newPlot('fut-chart', traces, layout, { responsive: true, displayModeBar: false });
}
