/**
 * Product Explorer Module
 */

let explorerSearchQuery = '';
let selectedExplorerSymbols = new Set(['GOLDBEES', 'SGBAPR28I']);
const _explorerCache = new Map();

document.addEventListener('DOMContentLoaded', () => {
  // Lazy-load: only execute if user started directly on the Explorer tab
  if (AppState.currentTab === 'explorer') {
    loadExplorer();
  }

  ['exp-category', 'exp-issuer', 'exp-expense', 'exp-aum', 'exp-period'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => loadExplorer());
  });

  document.getElementById('exp-reset')?.addEventListener('click', () => {
    document.getElementById('exp-category').value = 'ALL';
    document.getElementById('exp-issuer').value = 'ALL';
    document.getElementById('exp-expense').value = '';
    document.getElementById('exp-aum').value = '';
    document.getElementById('exp-period').value = '1Y';
    explorerSearchQuery = '';
    document.getElementById('global-search').value = '';
    loadExplorer();
  });

  document.getElementById('btn-compare-selected')?.addEventListener('click', () => {
    if (selectedExplorerSymbols.size === 0) {
      alert('Please select at least 1 product to compare.');
      return;
    }
    AppState.selectedSymbolsForCompare = Array.from(selectedExplorerSymbols).slice(0, 5);
    switchTab('compare');
  });

  window.runExplorerSearch = function(query) {
    explorerSearchQuery = query;
    loadExplorer();
  };

  window.addEventListener('tabActivated', (e) => {
    if (e.detail.tab === 'explorer') {
      loadExplorer();
    }
  });

  window.addEventListener('dataRefreshed', () => {
    _explorerCache.clear();
    loadExplorer();
  });
});

async function loadExplorer() {
  const category = document.getElementById('exp-category').value;
  const issuer = document.getElementById('exp-issuer').value;
  const maxExp = document.getElementById('exp-expense').value;
  const minAum = document.getElementById('exp-aum').value;
  const period = document.getElementById('exp-period').value;

  document.getElementById('exp-period-col').textContent = `${period} Return`;

  const params = new URLSearchParams({ category, issuer, period, search: explorerSearchQuery });
  if (maxExp !== '') params.append('max_expense', maxExp);
  if (minAum !== '') params.append('min_aum', minAum);
  const cacheKey = params.toString();

  if (_explorerCache.has(cacheKey)) {
    const cachedData = _explorerCache.get(cacheKey);
    AppState.allProducts = cachedData.products;
    renderExplorerTable(cachedData.products);
    updateSelectedCount();
    return;
  }

  try {
    const res = await fetch(`/api/explorer?${cacheKey}`);
    const data = await res.json();
    _explorerCache.set(cacheKey, data);
    AppState.allProducts = data.products;

    // Populate Issuer dropdown once if empty
    const issuerSelect = document.getElementById('exp-issuer');
    if (issuerSelect.options.length <= 1 && data.issuers) {
      data.issuers.forEach(iss => {
        const opt = document.createElement('option');
        opt.value = iss;
        opt.textContent = iss;
        issuerSelect.appendChild(opt);
      });
    }

    renderExplorerTable(data.products);
    updateSelectedCount();
  } catch (err) {
    console.error('Explorer load error:', err);
  }
}

function renderExplorerTable(products) {
  const tbody = document.getElementById('exp-table-body');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:24px;">No products match the current filters.</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => {
    const isChecked = selectedExplorerSymbols.has(p.symbol) ? 'checked' : '';
    const expStr = p.category === 'SGB' ? '0% (No TER)' : `${p.expense_ratio.toFixed(2)}%`;
    const retStr = p.return_pct !== null
      ? `<span class="${p.return_pct >= 0 ? 'val-up' : 'val-down'}" style="font-weight:600;">${p.return_pct > 0 ? '+' : ''}${p.return_pct}%</span>`
      : `<span style="color:var(--text-muted);" title="${p.coverage_note || ''}">N/A</span>`;

    const chgPct = p.day_change_pct;
    const chgStr = (chgPct !== null && chgPct !== undefined)
      ? `<span class="${chgPct >= 0 ? 'val-up' : 'val-down'}" style="font-size:0.74rem;">${chgPct >= 0 ? '+' : ''}${chgPct}%</span>`
      : '';

    const sgbValHint = (p.category === 'SGB' && p.sgb_indicative_valuation && p.sgb_indicative_valuation.estimated_gold_value)
      ? `<div style="font-size:0.68rem; color:var(--primary);">Ind. Gold Value: ₹${Number(p.sgb_indicative_valuation.estimated_gold_value).toLocaleString('en-IN')} (${p.sgb_indicative_valuation.premium_discount_pct >= 0 ? '+' : ''}${p.sgb_indicative_valuation.premium_discount_pct}%)</div>`
      : '';

    const priceHtml = `
      <div style="font-weight:700;">₹${Number(p.latest_price).toLocaleString('en-IN')} ${chgStr}</div>
      <div style="font-size:0.7rem; color:var(--text-muted);">${p.price_type} · ${p.latest_date} · <span class="tag-note" style="padding:0 4px; font-size:0.64rem;">${p.data_status || 'HISTORICAL'}</span></div>
      ${sgbValHint}
    `;

    return `
      <tr class="exp-row" data-sym="${p.symbol}" style="cursor:pointer;">
        <td onclick="event.stopPropagation();"><input type="checkbox" class="exp-checkbox" data-sym="${p.symbol}" ${isChecked} /></td>
        <td>
          <div style="font-weight:600;">${p.symbol}</div>
          <div style="font-size:0.74rem; color:var(--text-muted);">${p.name} · ${p.issuer}</div>
        </td>
        <td><span class="tag tag-${p.category.toLowerCase()}">${p.category}</span></td>
        <td>${priceHtml}</td>
        <td style="font-size:0.78rem;">${p.min_investment_display || '—'}</td>
        <td>${expStr}</td>
        <td>${retStr}</td>
        <td><span class="tag-note">${p.risk_tier}</span></td>
        <td><button class="btn btn-outline btn-detail" data-sym="${p.symbol}" style="padding:4px 10px; font-size:0.75rem;">View</button></td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.exp-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const sym = e.target.getAttribute('data-sym');
      if (e.target.checked) {
        if (selectedExplorerSymbols.size >= 5) {
          alert('You can compare up to 5 products at once.');
          e.target.checked = false;
          return;
        }
        selectedExplorerSymbols.add(sym);
      } else {
        selectedExplorerSymbols.delete(sym);
      }
      updateSelectedCount();
    });
  });

  document.querySelectorAll('.exp-row, .btn-detail').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const sym = el.getAttribute('data-sym');
      const prod = products.find(x => x.symbol === sym);
      if (prod) openProductDetailModal(prod);
    });
  });
}

async function openProductDetailModal(p) {
  const modal = document.getElementById('info-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');

  titleEl.innerHTML = `${p.symbol} <span class="tag tag-${p.category.toLowerCase()}" style="margin-left:8px;">${p.category}</span>`;

  let catExplain = '';
  let specificHtml = '';

  if (p.category === 'SGB') {
    const val = p.sgb_indicative_valuation || {};
    const estValStr = val.estimated_gold_value ? `₹${Number(val.estimated_gold_value).toLocaleString('en-IN')}` : 'N/A';
    const mktValStr = val.market_price ? `₹${Number(val.market_price).toLocaleString('en-IN')}` : 'Unavailable';
    const premVal = val.premium_discount_pct;
    const premStr = (premVal !== null && premVal !== undefined)
      ? `<span class="${premVal <= 0 ? 'val-up' : 'val-down'}">${premVal >= 0 ? '+' : ''}${premVal}% (${premVal >= 0 ? 'Premium' : 'Discount'})</span>`
      : 'N/A';

    catExplain = '<strong>How Sovereign Gold Bonds (SGBs) work:</strong> Government-backed bonds denominated in grams of gold. You earn 2.5% annual interest on the issue price plus gold price appreciation. Held to 8-year maturity, capital gains are tax-free.';
    specificHtml = `
      <div style="background:var(--input-bg); border:1px solid var(--primary); border-radius:8px; padding:10px 12px; margin-bottom:12px;">
        <div style="font-size:0.78rem; font-weight:700; color:var(--primary); margin-bottom:6px;">
          Indicative Gold-Linked SGB Valuation (${val.gold_grams_per_unit || 1}g unit × ₹${val.benchmark_price_per_gram ? Number(val.benchmark_price_per_gram).toLocaleString('en-IN') : '—'}/g)
        </div>
        <div class="detail-grid" style="margin:6px 0;">
          <div class="detail-stat" style="background:var(--card-bg);"><div class="detail-stat-label">Estimated Gold-Linked Value</div><div class="detail-stat-val" style="color:var(--primary);">${estValStr}</div></div>
          <div class="detail-stat" style="background:var(--card-bg);"><div class="detail-stat-label">Exchange Market Price (${val.market_status || 'HISTORICAL'})</div><div class="detail-stat-val">${mktValStr}</div></div>
          <div class="detail-stat" style="background:var(--card-bg);"><div class="detail-stat-label">Premium / Discount vs Gold</div><div class="detail-stat-val">${premStr}</div></div>
        </div>
        <div style="font-size:0.7rem; color:var(--text-muted);">
          ${val.valuation_label || 'Indicative valuation only — NOT an actual exchange price or guaranteed RBI redemption price.'}<br>
          Benchmark Source: ${val.benchmark_source || 'N/A'} · Updated: ${val.benchmark_timestamp || 'N/A'}
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-stat"><div class="detail-stat-label">Exchange Price</div><div class="detail-stat-val">₹${Number(p.latest_price).toLocaleString('en-IN')}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Nominal Issue / Face Value</div><div class="detail-stat-val">${p.nominal_price ? '₹' + Number(p.nominal_price).toLocaleString('en-IN') : 'N/A'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Remaining Tenure</div><div class="detail-stat-val">${p.remaining_years !== undefined ? p.remaining_years + ' yrs' : 'N/A'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Issue Date</div><div class="detail-stat-val">${p.issue_date || 'N/A'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Maturity Date</div><div class="detail-stat-val">${p.maturity_date || 'N/A'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Coupon Rate</div><div class="detail-stat-val">${p.coupon_rate_pct || 2.5}% p.a. (${p.coupon_frequency || 'Semi-annual'})</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Early Exit Eligible?</div><div class="detail-stat-val">${p.early_redemption_eligible ? 'Yes (5+ yrs completed)' : 'Locked (< 5 yrs)'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Liquidity</div><div class="detail-stat-val" style="font-size:0.78rem;">${p.liquidity_summary || p.liquidity_flag}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Expense Ratio</div><div class="detail-stat-val">0.00%</div></div>
      </div>
      <div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:10px;"><strong>Redemption Terms:</strong> ${p.redemption_terms || ''}</div>
    `;
  } else if (p.category === 'FOF') {
    catExplain = '<strong>How Gold Fund of Funds (FoFs) work:</strong> Mutual funds that invest in Gold ETFs. No Demat account is needed and you can start with a small SIP. <em>Note: Official NAV is published once daily after market close — not an intraday trading price.</em>';
    specificHtml = `
      <div class="detail-grid">
        <div class="detail-stat"><div class="detail-stat-label">Latest Official NAV</div><div class="detail-stat-val">₹${Number(p.latest_price).toLocaleString('en-IN')}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">NAV Date</div><div class="detail-stat-val">${p.latest_date}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Face Value</div><div class="detail-stat-val">₹${p.face_value || 10}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Min Lump-Sum</div><div class="detail-stat-val">${p.min_lumpsum ? '₹' + Number(p.min_lumpsum).toLocaleString('en-IN') : 'Verify with AMC'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Min SIP</div><div class="detail-stat-val">${p.min_sip ? '₹' + Number(p.min_sip).toLocaleString('en-IN') : 'Verify with AMC'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">SIP Frequencies</div><div class="detail-stat-val" style="font-size:0.78rem;">${p.sip_frequency || 'Monthly'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Min Additional</div><div class="detail-stat-val">${p.min_additional ? '₹' + Number(p.min_additional).toLocaleString('en-IN') : 'Verify with AMC'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Expense Ratio (TER)</div><div class="detail-stat-val">${p.expense_ratio.toFixed(2)}%</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Maturity</div><div class="detail-stat-val" style="font-size:0.76rem;">No fixed maturity (open-ended)</div></div>
      </div>
      <div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:10px;"><strong>Exit Load:</strong> ${p.exit_load_rule || 'Verify with AMC'} · <strong>First Observed NAV:</strong> ${p.first_date}</div>
    `;
  } else {
    catExplain = '<strong>How Gold ETFs work:</strong> Exchange-traded funds backed by physical 24K gold. Units trade on NSE/BSE during market hours (Demat account required) and can be bought starting from 1 unit.';
    specificHtml = `
      <div class="detail-grid">
        <div class="detail-stat"><div class="detail-stat-label">Market Price</div><div class="detail-stat-val">₹${Number(p.latest_price).toLocaleString('en-IN')}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Previous Close</div><div class="detail-stat-val">₹${Number(p.prev_close || p.latest_price).toLocaleString('en-IN')}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Min Investment</div><div class="detail-stat-val">1 unit (~₹${Math.round(p.latest_price).toLocaleString('en-IN')})</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Expense Ratio (TER)</div><div class="detail-stat-val">${p.expense_ratio.toFixed(2)}%</div></div>
        <div class="detail-stat"><div class="detail-stat-label">AUM</div><div class="detail-stat-val">${p.aum_cr ? '₹' + Number(p.aum_cr).toLocaleString('en-IN') + ' Cr' : 'N/A'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Face Value</div><div class="detail-stat-val">₹${p.face_value || 1}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Liquidity</div><div class="detail-stat-val" style="font-size:0.76rem;">${p.liquidity_summary || 'Exchange Traded'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Avg Daily Volume</div><div class="detail-stat-val">${p.average_volume ? Math.round(p.average_volume).toLocaleString('en-IN') : 'N/A'}</div></div>
        <div class="detail-stat"><div class="detail-stat-label">Maturity</div><div class="detail-stat-val" style="font-size:0.76rem;">Open-ended (no fixed maturity)</div></div>
      </div>
    `;
  }

  bodyEl.innerHTML = `
    <div style="font-size:0.86rem; font-weight:600; color:var(--text); margin-bottom:8px;">${p.name} · ${p.issuer}</div>
    <div class="info-banner" style="margin-bottom:12px;">${catExplain}</div>
    ${specificHtml}
    <div style="border-top:1px solid var(--card-border); padding-top:12px; margin-top:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="color:var(--primary); font-size:0.9rem;">${p.category === 'FOF' ? '30-Day Official NAV Trend' : '1-Day / Latest Trading Chart'}</strong>
        <button class="btn btn-outline" id="btn-refresh-intraday" style="padding:3px 10px; font-size:0.75rem;">Refresh</button>
      </div>
      <div id="modal-intraday-stats" style="font-size:0.78rem; color:var(--text-muted); margin-bottom:8px;">Loading chart...</div>
      <div id="modal-intraday-chart" style="height:210px;"></div>
      <div id="modal-intraday-note" style="font-size:0.72rem; color:var(--text-muted); margin-top:6px;"></div>
    </div>
  `;

  modal.classList.add('open');

  async function loadIntraday(refresh = false) {
    try {
      const res = await fetch(`/api/product/${p.symbol}/intraday?refresh=${refresh}`);
      const idata = await res.json();
      if (idata.error) {
        document.getElementById('modal-intraday-stats').textContent = idata.error;
        return;
      }

      const chgCls = idata.change_inr >= 0 ? 'val-up' : 'val-down';
      const chgSign = idata.change_inr >= 0 ? '+' : '-';
      let statsHtml = `<strong>${idata.price_label}:</strong> ₹${idata.current_price} (<span class="${chgCls}">${chgSign}₹${Math.abs(idata.change_inr)} / ${idata.change_pct >= 0 ? '+' : ''}${idata.change_pct}%</span>) · <strong>Prev Close:</strong> ₹${idata.prev_close}`;
      if (idata.open !== null && idata.open !== undefined) {
        statsHtml += ` · <strong>O/H/L:</strong> ₹${idata.open} / ₹${idata.high} / ₹${idata.low}`;
      }
      if (idata.volume !== null && idata.volume !== undefined) {
        statsHtml += ` · <strong>Vol:</strong> ${Number(idata.volume).toLocaleString('en-IN')}`;
      }
      statsHtml += ` · <span class="tag-note">${idata.status}</span>`;
      document.getElementById('modal-intraday-stats').innerHTML = statsHtml;
      document.getElementById('modal-intraday-note').textContent = `${idata.note || ''} (Updated: ${idata.trading_time} · Source: ${idata.source})`;

      const styles = getComputedStyle(document.documentElement);
      const goldColor = styles.getPropertyValue('--primary').trim();
      const textColor = styles.getPropertyValue('--text-muted').trim();
      const gridColor = styles.getPropertyValue('--chart-grid').trim();

      const minV = Math.min(...idata.prices);
      const maxV = Math.max(...idata.prices);
      const pad = (maxV - minV) * 0.15 || maxV * 0.02;

      const primaryText = styles.getPropertyValue('--text').trim();
      const cardBg = styles.getPropertyValue('--card-bg').trim();

      Plotly.newPlot('modal-intraday-chart', [{
        x: idata.timestamps,
        y: idata.prices,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 4, color: goldColor },
        line: { color: goldColor, width: 2 },
        hovertemplate: '₹%{y:,.2f}<extra></extra>'
      }], {
        margin: { t: 8, r: 12, b: 28, l: 55 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        hoverlabel: {
          bgcolor: cardBg,
          bordercolor: goldColor,
          font: { color: primaryText, size: 11 }
        },
        xaxis: { showgrid: false, color: textColor, tickfont: { size: 10, color: textColor } },
        yaxis: { gridcolor: gridColor, color: textColor, tickprefix: '₹', tickfont: { size: 10, color: textColor }, range: [minV - pad, maxV + pad] },
        hovermode: 'x unified'
      }, { responsive: true, displayModeBar: false });
    } catch (e) {
      document.getElementById('modal-intraday-stats').textContent = 'Failed to load trading chart.';
    }
  }

  document.getElementById('btn-refresh-intraday')?.addEventListener('click', () => loadIntraday(true));
  loadIntraday(false);
}

function updateSelectedCount() {
  document.getElementById('exp-selected-count').textContent = `${selectedExplorerSymbols.size} selected`;
}
