/**
 * GoldWise Application Core Controller
 * Manages Tab Navigation, Dark/Light Theme Switching, Sidebar Collapse, and Modals.
 */

const _urlTheme = new URLSearchParams(window.location.search).get('theme');
const AppState = {
  currentTab: 'overview',
  theme: _urlTheme || localStorage.getItem('gw_theme') || 'dark',
  selectedSymbolsForCompare: ['GOLDBEES', 'SGBAPR28I', 'HDFC_GOLD_ETF_FOF'],
  allProducts: []
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initSidebar();
  initModals();
  initGlobalSearch();
  initDataRefreshControls();
});

function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', AppState.theme);
      localStorage.setItem('gw_theme', AppState.theme);
      // Notify active tab to redraw Plotly charts with new theme colors
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: AppState.theme } }));
    });
  }
}

function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar .nav-menu .nav-item');
  const headings = {
    overview: 'Gold market overview',
    explorer: 'Product explorer',
    compare: 'Compare products',
    simulator: 'Investment simulator',
    shortlist: 'Preference-based decision support',
    assistant: 'Goldwise assistant'
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });

  window.switchTab = function(tabId) {
    AppState.currentTab = tabId;
    navItems.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId));

    document.querySelectorAll('.page-tab').forEach(tab => {
      tab.classList.toggle('active', tab.id === `tab-${tabId}`);
    });

    const titleEl = document.getElementById('page-title');
    if (titleEl && headings[tabId]) {
      titleEl.textContent = headings[tabId];
    }

    // Trigger tab specific data load / chart resize
    window.dispatchEvent(new CustomEvent('tabActivated', { detail: { tab: tabId } }));
  };

  const hashTab = (window.location.hash || '').replace('#', '');
  if (hashTab && headings[hashTab]) {
    switchTab(hashTab);
  }
}

function initSidebar() {
  const collapseBtn = document.getElementById('btn-collapse');
  const sidebar = document.getElementById('sidebar');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
    });
  }
}

function initModals() {
  const modal = document.getElementById('info-modal');
  const closeBtn = document.getElementById('modal-close');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');

  function openModal(title, htmlContent) {
    titleEl.textContent = title;
    bodyEl.innerHTML = htmlContent;
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById('btn-sources')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      let html = '<h3 style="margin-bottom:10px; color:var(--primary);">Data Sources &amp; Coverage</h3><ul style="padding-left:18px; margin-bottom:16px;">';
      data.data_sources.forEach(s => {
        html += `<li style="margin-bottom:8px;"><strong>${s.category}:</strong> ${s.source} (${s.coverage})<br><small style="color:var(--text-muted);">${s.notes || ''}</small></li>`;
      });
      html += '</ul><h3 style="margin-bottom:10px; color:var(--primary);">Methodology &amp; Conventions</h3><ul style="padding-left:18px;">';
      html += `<li><strong>CAGR:</strong> ${data.methodology.cagr_convention}</li>`;
      html += `<li><strong>Volatility:</strong> ${data.methodology.volatility_convention}</li>`;
      html += `<li><strong>Risk-Free Rate:</strong> ${data.methodology.risk_free_rate}</li>`;
      html += `<li><strong>Missing Data Policy:</strong> ${data.methodology.missing_data_policy}</li>`;
      html += `<li><strong>Outlier Policy:</strong> ${data.methodology.outlier_policy}</li>`;
      html += '</ul>';
      openModal('Sources & Analytical Methodology', html);
    } catch (e) {
      openModal('Sources', '<p>Failed to load sources from API.</p>');
    }
  });

  document.getElementById('btn-disclaimer')?.addEventListener('click', () => {
    const html = `
      <p style="margin-bottom:12px;"><strong>Educational &amp; Decision-Support Platform:</strong> GoldWise is designed strictly for educational and analytical decision support for Indian retail investors studying gold investment avenues.</p>
      <p style="margin-bottom:12px;"><strong>Not Financial Advice:</strong> Nothing on this platform constitutes personalized financial, investment, tax, or legal advice under SEBI guidelines. Past performance does not guarantee future results.</p>
      <p style="margin-bottom:12px;"><strong>Price vs Total Return:</strong> SGB comparisons show price-only return unless coupon cash flows are explicitly enabled. Market prices may deviate from indicative NAVs during market hours.</p>
    `;
    openModal('Platform Disclaimer', html);
  });
}

function initGlobalSearch() {
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          switchTab('explorer');
          const expSearch = document.getElementById('exp-category');
          if (window.runExplorerSearch) window.runExplorerSearch(query);
        }
      }
    });
  }
}

function initDataRefreshControls() {
  const refreshBtn = document.getElementById('btn-refresh-data');
  const statusBtn = document.getElementById('btn-data-status');

  async function fetchAndRenderStatus() {
    try {
      const res = await fetch('/api/data/status');
      if (!res.ok) return null;
      const panel = await res.json();
      updateHeaderStatusUI(panel);
      return panel;
    } catch (e) {
      return null;
    }
  }

  function updateHeaderStatusUI(panel) {
    if (!panel || !panel.categories) return;
    const cats = Object.values(panel.categories);
    const anyFallback = cats.some(c => c.is_fallback);
    const allFallback = cats.every(c => c.is_fallback);
    const dot = document.getElementById('header-status-dot');
    const txt = document.getElementById('header-status-text');
    const tsEl = document.getElementById('header-last-refreshed');

    if (dot) {
      dot.style.background = allFallback ? 'var(--warning)' : (anyFallback ? 'var(--primary)' : 'var(--success)');
    }
    if (txt) {
      txt.textContent = allFallback ? 'CSV Fallback' : (anyFallback ? 'API + CSV' : 'API Active');
    }
    if (tsEl && panel.last_refreshed) {
      tsEl.textContent = `Updated: ${panel.last_refreshed.split(' ')[1] || panel.last_refreshed}`;
      tsEl.title = `Last refreshed: ${panel.last_refreshed}`;
    }
  }

  window.updateHeaderStatusUI = updateHeaderStatusUI;

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      const origText = refreshBtn.textContent;
      refreshBtn.textContent = '↻ Refreshing...';
      refreshBtn.disabled = true;
      try {
        const res = await fetch('/api/data/refresh?force=true', { method: 'POST' });
        if (res.ok) {
          const panel = await res.json();
          updateHeaderStatusUI(panel);
          window.dispatchEvent(new CustomEvent('dataRefreshed', { detail: panel }));
        }
      } catch (e) {
        console.error('Refresh error:', e);
      } finally {
        refreshBtn.textContent = origText;
        refreshBtn.disabled = false;
      }
    });
  }

  if (statusBtn) {
    statusBtn.addEventListener('click', async () => {
      const panel = await fetchAndRenderStatus();
      const modal = document.getElementById('info-modal');
      const titleEl = document.getElementById('modal-title');
      const bodyEl = document.getElementById('modal-body');
      if (!panel) return;

      const labels = {
        benchmark: 'Gold Benchmark (INR/g)',
        etf: 'Gold ETFs',
        sgb: 'Sovereign Gold Bonds (SGB)',
        fof: 'Gold Fund of Funds (FoF)'
      };

      let rowsHtml = Object.entries(panel.categories).map(([key, info]) => {
        const statusColor = info.is_fallback ? 'var(--warning)' : 'var(--success)';
        return `
          <tr>
            <td style="font-weight:600;">${labels[key] || key.toUpperCase()}</td>
            <td><span class="tag-note" style="color:${statusColor}; border-color:${statusColor};">${info.status}</span></td>
            <td style="font-size:0.78rem;">${info.source}</td>
            <td style="font-size:0.78rem;">${info.observation_date || 'N/A'}</td>
            <td style="font-size:0.74rem; color:var(--text-muted);">${info.error || 'OK'}</td>
          </tr>
        `;
      }).join('');

      titleEl.textContent = 'Data-Source Status Panel (API-First + CSV Fallback)';
      bodyEl.innerHTML = `
        <div class="info-banner" style="margin-bottom:12px;">
          GoldWise attempts live/official APIs first (GoldAPI, Yahoo Finance, MFAPI) and automatically falls back to validated local CSV datasets if an API fails, times out, or returns invalid data.
        </div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:10px;">
          <strong>Last Refresh Attempt:</strong> ${panel.last_refreshed}
        </div>
        <div class="table-container">
          <table class="gw-table">
            <thead><tr><th>Category</th><th>Status</th><th>Source</th><th>Obs Date</th><th>Notes</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      `;
      modal.classList.add('open');
    });
  }

  fetchAndRenderStatus();
}
