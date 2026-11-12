/**
 * Side-by-Side Comparison Module
 */

let currentComparePeriod = '3Y';
let cachedCompareData = null;

document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('#cmp-period-pills .period-pill');
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      currentComparePeriod = p.getAttribute('data-period');
      loadComparison();
    });
  });

  document.getElementById('cmp-sgb-coupon')?.addEventListener('change', () => {
    loadComparison();
  });

  window.addEventListener('tabActivated', (e) => {
    if (e.detail.tab === 'compare') {
      loadComparison();
    }
  });

  window.addEventListener('themeChanged', () => {
    if (cachedCompareData && AppState.currentTab === 'compare') {
      renderCompareChart(cachedCompareData);
    }
  });
});

function renderCompareChips() {
  const container = document.getElementById('cmp-chips-container');
  const syms = AppState.selectedSymbolsForCompare;

  let html = syms.map(sym => `
    <span style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:16px;
                 background:var(--chip-bg); border:1px solid var(--chip-border); font-size:0.82rem; font-weight:600; color:var(--primary);">
      ${sym}
      <button onclick="removeCompareSymbol('${sym}')" style="background:none; border:none; color:var(--text); cursor:pointer; font-weight:700;">&times;</button>
    </span>
  `).join('');

  if (syms.length < 5) {
    html += `
      <select id="cmp-add-select" class="filter-select" style="padding:4px 10px; border-radius:16px; font-size:0.82rem;">
        <option value="">+ Add product</option>
        ${AppState.allProducts
          .filter(p => !syms.includes(p.symbol))
          .map(p => `<option value="${p.symbol}">${p.symbol} (${p.category})</option>`)
          .join('')}
      </select>
    `;
  }

  container.innerHTML = html;

  document.getElementById('cmp-add-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val && !AppState.selectedSymbolsForCompare.includes(val)) {
      AppState.selectedSymbolsForCompare.push(val);
      loadComparison();
    }
  });
}

window.removeCompareSymbol = function(sym) {
  if (AppState.selectedSymbolsForCompare.length <= 1) {
    alert('Keep at least 1 product selected.');
    return;
  }
  AppState.selectedSymbolsForCompare = AppState.selectedSymbolsForCompare.filter(s => s !== sym);
  loadComparison();
};

async function loadComparison() {
  renderCompareChips();
  const includeCoupon = document.getElementById('cmp-sgb-coupon')?.checked || false;

  try {
    const res = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: AppState.selectedSymbolsForCompare,
        period: currentComparePeriod,
        include_sgb_coupon: includeCoupon
      })
    });

    if (!res.ok) {
      const err = await res.json();
      document.getElementById('cmp-common-window').textContent = err.detail || 'Error loading comparison';
      return;
    }

    const data = await res.json();
    cachedCompareData = data;

    document.getElementById('cmp-common-window').textContent =
      `Window: ${data.common_start_date} → ${data.common_end_date} (${data.common_trading_days} days)`;

    renderCompareChart(data);
    renderCompareTable(data.comparison_table);
    renderCompareTakeaway(data.comparison_table, data.common_start_date, data.common_end_date);
  } catch (err) {
    console.error('Compare API error:', err);
  }
}

function renderCompareTakeaway(rows, startDt, endDt) {
  const el = document.getElementById('cmp-takeaway');
  if (!el || !rows || rows.length === 0) return;

  const valid = rows.filter(r => r.absolute_return_pct !== null && r.absolute_return_pct !== undefined);
  if (valid.length === 0) {
    el.style.display = 'none';
    return;
  }

  const sorted = [...valid].sort((a, b) => b.absolute_return_pct - a.absolute_return_pct);
  const best = sorted[0];
  const cats = [...new Set(rows.map(r => r.category))];

  let catDiff = '';
  if (cats.length > 1) {
    catDiff = ' <strong>Key structural differences:</strong> SGBs have 0% TER + 2.5% annual coupon (with an 8-year maturity); Gold ETFs offer intraday NSE liquidity (Demat required); Gold FoFs allow Demat-free SIPs via daily NAV.';
  }

  el.innerHTML = `<strong>Comparison Takeaway (${startDt} → ${endDt}):</strong> <strong>${best.symbol}</strong> (${best.category}) led with <strong>${best.absolute_return_pct}%</strong> total return${best.expense_ratio !== null ? ` and a <strong>${best.expense_ratio}%</strong> expense ratio` : ''}.${catDiff}`;
  el.style.display = 'block';
}

function renderCompareChart(data) {
  const styles = getComputedStyle(document.documentElement);
  const goldColor = styles.getPropertyValue('--primary').trim() || '#E7BC68';
  const textColor = styles.getPropertyValue('--text-muted').trim();
  const primaryText = styles.getPropertyValue('--text').trim();
  const cardBg = styles.getPropertyValue('--card-bg').trim();
  const gridColor = styles.getPropertyValue('--chart-grid').trim();
  const palette = ['#4C9A91', '#8B9BA6', '#C9A86A', '#56D6A4', '#E7BC68'];

  const traces = [];
  let idx = 0;

  for (const [sym, values] of Object.entries(data.normalized_series)) {
    const isBenchmark = sym === 'GOLD_BENCHMARK';
    traces.push({
      x: data.dates,
      y: values,
      name: isBenchmark ? 'Gold Benchmark' : sym,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: isBenchmark ? goldColor : palette[idx % palette.length],
        width: isBenchmark ? 2 : 2.5,
        dash: isBenchmark ? 'dash' : 'solid'
      },
      hovertemplate: '₹%{y:.2f}<extra></extra>'
    });
    if (!isBenchmark) idx++;
  }

  const layout = {
    margin: { t: 10, r: 16, b: 30, l: 55 },
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

  Plotly.newPlot('cmp-growth-chart', traces, layout, { responsive: true, displayModeBar: false });
}

function renderCompareTable(rows) {
  const thead = document.getElementById('cmp-table-head');
  const tbody = document.getElementById('cmp-table-body');

  thead.innerHTML = `
    <tr>
      <th>Metric</th>
      ${rows.map(r => `<th>${r.symbol} <span class="tag tag-${r.category.toLowerCase()}">${r.category}</span></th>`).join('')}
    </tr>
  `;

  const metricsSpec = [
    { label: 'Total / Period Return', key: 'absolute_return_pct', suffix: '%' },
    { label: 'CAGR (Annualized)', key: 'cagr', suffix: '%' },
    { label: 'Annualized Volatility', key: 'volatility', suffix: '%' },
    { label: 'Max Drawdown', key: 'max_drawdown', suffix: '%' },
    { label: 'Sharpe Ratio (Rf=6.5%)', key: 'sharpe_ratio', suffix: '' },
    { label: 'Tracking Difference vs Gold', key: 'tracking_difference', suffix: '%' },
    { label: 'Tracking Error (Ann.)', key: 'tracking_error', suffix: '%' },
    { label: 'Correlation with Gold', key: 'correlation', suffix: '' },
    { label: 'Expense Ratio', key: 'expense_ratio', suffix: '%' },
    { label: 'Liquidity Profile', key: 'liquidity_summary', suffix: '' },
    { label: 'Data Coverage / Return Type', key: 'data_note', isBadge: true }
  ];

  tbody.innerHTML = metricsSpec.map(m => `
    <tr>
      <td style="font-weight:600; color:var(--text-muted);">${m.label}</td>
      ${rows.map(r => {
        const val = r[m.key];
        if (m.isBadge) {
          return `<td><span class="tag-note">${val}</span></td>`;
        }
        if (val === null || val === undefined) {
          return `<td><span class="tag-note">insufficient data</span></td>`;
        }
        if (typeof val === 'number') {
          const colorCls = (m.key === 'max_drawdown' && val < 0) ? 'val-down' :
                           (m.key === 'cagr' || m.key === 'absolute_return_pct') ? (val >= 0 ? 'val-up' : 'val-down') : '';
          return `<td class="${colorCls}" style="font-weight:600;">${val}${m.suffix}</td>`;
        }
        return `<td style="font-size:0.8rem;">${val}</td>`;
      }).join('')}
    </tr>
  `).join('');
}
