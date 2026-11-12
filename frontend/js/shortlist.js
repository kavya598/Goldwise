/**
 * Preference-Based Decision Support Module
 */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-run-shortlist')?.addEventListener('click', runShortlist);
});

async function runShortlist() {
  const horizon_years = parseFloat(document.getElementById('sh-horizon').value);
  const liquidity_need = document.getElementById('sh-liquidity').value;
  const risk_tolerance = document.getElementById('sh-risk').value;
  const preferred_category = document.getElementById('sh-category').value;

  const container = document.getElementById('shortlist-results');
  container.innerHTML = '<div class="card"><p style="color:var(--text-muted);">Evaluating candidates across hard constraints and multi-factor scoring...</p></div>';

  try {
    const res = await fetch('/api/shortlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        horizon_years,
        liquidity_need,
        risk_tolerance,
        preferred_category,
        include_kmeans: true
      })
    });

    const data = await res.json();
    if (!res.ok) {
      container.innerHTML = `<div class="card"><p style="color:var(--danger);">${data.detail || 'Evaluation failed'}</p></div>`;
      return;
    }

    if (!data.shortlist || data.shortlist.length === 0) {
      container.innerHTML = `
        <div class="card">
          <h3 style="color:var(--primary); margin-bottom:8px;">No Direct Matches Found</h3>
          <p style="color:var(--text-muted); font-size:0.88rem;">${data.message || 'Try relaxing your constraints (e.g. choose All categories or Flexible liquidity).'}</p>
        </div>
      `;
      return;
    }

    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h3 style="font-size:1.05rem; font-weight:600; color:var(--text);">Recommended Shortlist (${data.shortlist.length} products)</h3>
        <span style="font-size:0.75rem; color:var(--text-muted);">Ranked by transparent multi-factor utility</span>
      </div>
    `;

    data.shortlist.forEach((item, idx) => {
      const cagrText = item.cagr !== null ? `${item.cagr}%` : 'N/A';
      const volText = item.volatility !== null ? `${item.volatility}%` : 'N/A';
      const terText = item.category === 'SGB' ? '0.0% (Zero TER)' : `${item.expense_ratio}%`;

      html += `
        <div class="card" style="border-left: 4px solid var(--primary); margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:0.82rem; font-weight:700; color:var(--primary);">#${idx + 1}</span>
                <span style="font-size:1rem; font-weight:700; color:var(--text);">${item.symbol}</span>
                <span class="tag tag-${item.category.toLowerCase()}">${item.category}</span>
                <span class="tag-note">${item.risk_tier} Risk</span>
              </div>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${item.name}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.2rem; font-weight:700; color:var(--primary);">${item.composite_score}</div>
              <div style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase;">Score / 100</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin:12px 0; padding:10px; background:var(--input-bg); border-radius:6px; font-size:0.78rem;">
            <div><span style="color:var(--text-muted);">CAGR:</span> <strong>${cagrText}</strong></div>
            <div><span style="color:var(--text-muted);">Volatility:</span> <strong>${volText}</strong></div>
            <div><span style="color:var(--text-muted);">Expense:</span> <strong>${terText}</strong></div>
            <div><span style="color:var(--text-muted);">Start From:</span> <strong>${item.min_investment_display || '—'}</strong></div>
          </div>
          ${item.coverage_note ? `<div style="font-size:0.74rem; color:var(--text-muted); margin-bottom:6px;">${item.coverage_note} · ${item.risk_reason || ''}</div>` : ''}

          <div style="font-size:0.82rem; line-height:1.5;">
            <div style="color:var(--success); margin-bottom:4px;">
              <strong>Why Recommended:</strong> ${item.reasons.join(' · ') || 'Satisfies all core portfolio constraints.'}
            </div>
            <div style="color:var(--warning);">
              <strong>Trade-offs &amp; Notes:</strong> ${item.trade_offs.join(' · ') || 'Standard gold market volatility applies.'}
            </div>
          </div>
        </div>
      `;
    });

    if (data.excluded && data.excluded.length > 0) {
      html += `
        <details style="margin-top:16px; font-size:0.82rem; color:var(--text-muted); cursor:pointer;">
          <summary style="font-weight:600; padding:6px 0;">View ${data.excluded.length} excluded instruments (Violated Constraints)</summary>
          <ul style="padding-left:18px; margin-top:8px;">
            ${data.excluded.slice(0, 8).map(x => `<li><strong>${x.symbol}:</strong> ${x.reason}</li>`).join('')}
          </ul>
        </details>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p style="color:var(--danger);">Error loading shortlist: ${err.message}</p></div>`;
  }
}
