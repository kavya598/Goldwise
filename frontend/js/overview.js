/**
 * Overview Page Module
 */

let currentOverviewPeriod = '1Y';
let currentPerfPeriod = '1Y';
let cachedOverviewData = null;
const _overviewCache = new Map();

document.addEventListener('DOMContentLoaded', () => {
  loadOverview(currentOverviewPeriod, currentPerfPeriod);

  const pills = document.querySelectorAll('#ov-period-pills .period-pill');
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      currentOverviewPeriod = p.getAttribute('data-period');
      loadOverview(currentOverviewPeriod, currentPerfPeriod);
    });
  });

  const perfPills = document.querySelectorAll('#ov-perf-pills .period-pill');
  perfPills.forEach(p => {
    p.addEventListener('click', () => {
      perfPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      currentPerfPeriod = p.getAttribute('data-perf');
      loadOverview(currentOverviewPeriod, currentPerfPeriod);
    });
  });

  window.addEventListener('themeChanged', () => {
    if (cachedOverviewData && AppState.currentTab === 'overview') {
      renderOverviewChart(cachedOverviewData.chart);
    }
  });

  window.addEventListener('dataRefreshed', () => {
    _overviewCache.clear();
    loadOverview(currentOverviewPeriod, currentPerfPeriod);
  });
});

async function loadOverview(period = '1Y', perfPeriod = '1Y') {
  const cacheKey = `${period}_${perfPeriod}`;
  if (_overviewCache.has(cacheKey)) {
    applyOverviewData(_overviewCache.get(cacheKey), perfPeriod);
    return;
  }
  try {
    const res = await fetch(`/api/overview?period=${period}&perf_period=${perfPeriod}`);
    const data = await res.json();
    _overviewCache.set(cacheKey, data);
    applyOverviewData(data, perfPeriod);
  } catch (err) {
    console.error('Failed to load overview:', err);
  }
}

function applyOverviewData(data, perfPeriod = '1Y') {
  try {
    cachedOverviewData = data;

  // KPIs
  const b = data.benchmark;
  document.getElementById('ov-bench-price').textContent = `₹${b.latest_price.toLocaleString('en-IN')}`;
  document.getElementById('ov-bench-meta').textContent = `INR/g · ${b.date}`;

  const statusEl = document.getElementById('ov-bench-status');
  if (statusEl) {
    statusEl.textContent = b.price_status || 'Historical';
    statusEl.style.color = (b.price_status || '').includes('Live') ? 'var(--success)' : 'var(--text-muted)';
  }

  const todayEl = document.getElementById('ov-bench-today');
  if (todayEl) {
    if (b.today_change_inr !== null && b.today_change_inr !== undefined && b.today_change_pct !== null) {
      const sign = b.today_change_inr >= 0 ? '+' : '-';
      const cls = b.today_change_inr >= 0 ? 'val-up' : 'val-down';
      todayEl.innerHTML = `Today: <span class="${cls}" style="font-weight:600;">${sign}₹${Math.abs(b.today_change_inr).toLocaleString('en-IN')} (${b.today_change_pct >= 0 ? '+' : ''}${b.today_change_pct}%)</span>`;
    } else {
      todayEl.textContent = 'Today change: N/A';
    }
  }

  const chgEl = document.getElementById('ov-1y-change');
  const chg = b.change_1y_pct;
  chgEl.textContent = chg !== null ? `${chg > 0 ? '+' : ''}${chg}%` : '—';
  chgEl.className = 'kpi-value ' + (chg >= 0 ? 'val-up' : 'val-down');

  document.getElementById('ov-count-sgb').textContent = data.counts.SGB;
  document.getElementById('ov-count-etf').textContent = data.counts.ETF;
  document.getElementById('ov-count-fof').textContent = data.counts.FOF;

  const srcEl = document.getElementById('ov-chart-source');
  if (srcEl) {
    srcEl.textContent = `Source · ${b.source} · Obs: ${b.date} · Historical thru ${b.historical_end_date} · Status: ${b.price_status}`;
  }

  if (data.data_status_panel && window.updateHeaderStatusUI) {
    window.updateHeaderStatusUI(data.data_status_panel);
  }

  // Chart
  renderOverviewChart(data.chart);

  // Top & Bottom performers
  const perfLabel = perfPeriod === '1D' ? 'Today' : perfPeriod;
  const topTitle = document.getElementById('ov-perf-title');
  const botTitle = document.getElementById('ov-bot-title');
  if (topTitle) topTitle.textContent = `Top performers (${perfLabel})`;
  if (botTitle) botTitle.textContent = `Bottom performers (${perfLabel})`;

  const topEl = document.getElementById('ov-top-performers');
  topEl.innerHTML = data.top_performers.length
    ? data.top_performers.map(p => `
      <div class="performer-item">
        <div>
          <span class="tag tag-${p.category.toLowerCase()}" style="margin-right:6px;">${p.category}</span>
          <span class="performer-name" title="${p.name}">${p.symbol}</span>
        </div>
        <span class="performer-val ${p.return_pct >= 0 ? 'val-up' : 'val-down'}">${p.return_pct > 0 ? '+' : ''}${p.return_pct}%</span>
      </div>
    `).join('')
    : '<div style="color:var(--text-muted); font-size:0.8rem;">Insufficient data for selected period (N/A).</div>';

    const botEl = document.getElementById('ov-bottom-performers');
    botEl.innerHTML = data.bottom_performers.length
      ? data.bottom_performers.map(p => `
        <div class="performer-item">
          <div>
            <span class="tag tag-${p.category.toLowerCase()}" style="margin-right:6px;">${p.category}</span>
            <span class="performer-name" title="${p.name}">${p.symbol}</span>
          </div>
          <span class="performer-val ${p.return_pct >= 0 ? 'val-up' : 'val-down'}">${p.return_pct > 0 ? '+' : ''}${p.return_pct}%</span>
        </div>
      `).join('')
      : '<div style="color:var(--text-muted); font-size:0.8rem;">Insufficient data for selected period (N/A).</div>';

    // Bottom category cards
    const catContainer = document.getElementById('ov-category-cards');
    catContainer.innerHTML = data.category_summaries.map(c => `
      <div class="category-card">
        <div class="category-header">${c.category} (${c.count})</div>
        <div class="category-stat">${c.avg_1y_return !== null ? `Avg 1Y: +${c.avg_1y_return}%` : 'Avg 1Y: N/A'}</div>
        <div class="category-desc">${c.description}</div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error loading overview:', err);
  }
}

function renderOverviewChart(chartData) {
  const styles = getComputedStyle(document.documentElement);
  const goldColor = styles.getPropertyValue('--primary').trim();
  const textColor = styles.getPropertyValue('--text-muted').trim();
  const primaryText = styles.getPropertyValue('--text').trim();
  const cardBg = styles.getPropertyValue('--card-bg').trim();
  const gridColor = styles.getPropertyValue('--chart-grid').trim();
  const isDark = AppState.theme === 'dark';

  const trace = {
    x: chartData.dates,
    y: chartData.values,
    type: 'scatter',
    mode: 'lines',
    fill: 'tozeroy',
    fillcolor: isDark ? 'rgba(236, 196, 106, 0.22)' : 'rgba(196, 155, 56, 0.14)',
    line: { color: goldColor, width: 2.4 },
    hovertemplate: '₹%{y:,.2f} / g<extra></extra>'
  };

  const minVal = Math.min(...chartData.values);
  const maxVal = Math.max(...chartData.values);
  const pad = (maxVal - minVal) * 0.12 || maxVal * 0.05;

  const isIntraday = chartData.period === '1D';
  const layout = {
    margin: { t: 10, r: 14, b: 30, l: 60 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    hoverlabel: {
      bgcolor: cardBg,
      bordercolor: goldColor,
      font: {
        color: primaryText,
        size: 12,
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }
    },
    xaxis: {
      showgrid: false,
      color: textColor,
      tickfont: { size: 11, color: textColor, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      type: isIntraday ? 'category' : undefined,
      nticks: isIntraday ? 8 : undefined
    },
    yaxis: {
      gridcolor: gridColor,
      color: textColor,
      tickprefix: '₹',
      tickfont: { size: 11, color: textColor, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      range: [minVal - pad, maxVal + pad]
    },
    hovermode: 'x unified'
  };

  Plotly.newPlot('ov-benchmark-chart', [trace], layout, { responsive: true, displayModeBar: false })
    .then(() => Plotly.Plots.resize('ov-benchmark-chart'));
}
