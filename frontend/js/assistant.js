/**
 * Goldwise Research Assistant Frontend (per goldwise_assistant_brief.md)
 * Renders validated structured responses as clean UI components with zero raw markdown.
 */

let chatHistory = [];

const WELCOME_HTML = `
  <div class="chat-bubble assistant">
    <div class="assistant-answer">Welcome to Goldwise. I can help you understand and compare Sovereign Gold Bonds, Gold ETFs and Gold Funds of Funds using historical data. What would you like to look at?</div>
  </div>
`;

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('btn-chat-send');
  const newChatBtn = document.getElementById('btn-new-chat');

  sendBtn?.addEventListener('click', () => sendChatMessage());
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  newChatBtn?.addEventListener('click', () => {
    chatHistory = [];
    const col = getChatColumn();
    if (col) col.innerHTML = WELCOME_HTML;
  });

  document.querySelectorAll('.quick-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        document.getElementById('chat-input').value = prompt;
        sendChatMessage();
      }
    });
  });
});

function getChatColumn() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;
  let col = container.querySelector('.chat-column');
  if (!col) {
    col = document.createElement('div');
    col.className = 'chat-column';
    container.appendChild(col);
  }
  return col;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const idx = parseInt(m[2], 10) - 1;
  return `${parseInt(m[3], 10)} ${months[idx] || m[2]} ${m[1]}`;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const question = input.value.trim();
  if (!question) return;

  input.value = '';
  appendUserMessage(question);

  const messagesContainer = document.getElementById('chat-messages');
  const col = getChatColumn();
  const loadingBubble = document.createElement('div');
  loadingBubble.className = 'chat-bubble assistant';
  loadingBubble.id = 'chat-loading';
  loadingBubble.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Analysing data…</span>';
  col.appendChild(loadingBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const res = await fetch('/api/assistant/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history: chatHistory })
    });

    const data = await res.json();
    loadingBubble.remove();

    if (!res.ok) {
      appendStructuredAssistantMessage(question, {
        answer: "We couldn't retrieve this data right now. Please try again.",
        status: 'error'
      });
      return;
    }

    const structured = data.structured || { answer: data.answer, status: 'ok' };
    appendStructuredAssistantMessage(question, structured);
    chatHistory.push({ role: 'user', text: question });
    chatHistory.push({ role: 'model', text: structured.answer || data.answer });

    const refreshEl = document.getElementById('ai-last-refreshed');
    if (refreshEl) refreshEl.textContent = new Date().toLocaleTimeString();
  } catch (err) {
    loadingBubble.remove();
    appendStructuredAssistantMessage(question, {
      answer: "We couldn't retrieve this data right now. Please try again.",
      status: 'error'
    });
  }
}

function appendUserMessage(text) {
  const messagesContainer = document.getElementById('chat-messages');
  const col = getChatColumn();
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.textContent = text;
  col.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendStructuredAssistantMessage(question, s) {
  const messagesContainer = document.getElementById('chat-messages');
  const col = getChatColumn();
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble assistant';

  let html = '';

  if (s.status === 'insufficient_data') {
    html += '<div style="margin-bottom:6px;"><span class="tag-note">insufficient_data</span></div>';
  }

  // 1. Answer (first line, slightly larger text, no heading)
  html += `<div class="assistant-answer">${escapeHtml(s.answer)}</div>`;

  // 2. Figures
  if (Array.isArray(s.figures) && s.figures.length > 0) {
    html += '<div class="assistant-figures">' + s.figures.map(f => `
      <div class="assistant-fig-item">
        <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(f.label)}</div>
        <div class="assistant-fig-val">${escapeHtml(f.value)} ${escapeHtml(f.unit || '')}</div>
        <div class="assistant-fig-meta">${escapeHtml([f.period, f.source, formatDisplayDate(f.as_of_date)].filter(Boolean).join(' · '))}</div>
      </div>
    `).join('') + '</div>';
  }

  // 3. Comparison table (with right-aligned numbers & horizontal scroll)
  if (s.comparison && Array.isArray(s.comparison.columns) && Array.isArray(s.comparison.rows)) {
    html += `
      <div class="assistant-table-wrap">
        <table>
          <thead><tr>${s.comparison.columns.map((c, idx) => `<th style="${idx > 0 ? 'text-align:right;' : ''}">${escapeHtml(c)}</th>`).join('')}</tr></thead>
          <tbody>
            ${s.comparison.rows.map(row => `<tr>${row.map((cell, idx) => `<td style="${idx > 0 ? 'text-align:right;' : ''}">${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 4. Facts, Calculations, Assumptions (plain labels, no icons/emojis)
  const groups = [
    { label: 'Facts', items: s.facts },
    { label: 'Calculations', items: s.calculations },
    { label: 'Assumptions', items: s.assumptions }
  ];
  groups.forEach(g => {
    if (Array.isArray(g.items) && g.items.length > 0) {
      html += `
        <div class="assistant-group">
          <div class="assistant-group-label">${g.label}</div>
          <ul style="padding-left:18px; margin:2px 0 0 0;">
            ${g.items.map(it => `<li>${escapeHtml(it)}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  });

  // 5. Caveats
  if (Array.isArray(s.caveats) && s.caveats.length > 0) {
    html += `<div class="assistant-caveat ${s.status === 'error' ? 'is-error' : ''}">${s.caveats.map(c => escapeHtml(c)).join(' ')}</div>`;
  }

  // 6. Sources chips
  if (Array.isArray(s.sources) && s.sources.length > 0) {
    html += '<div class="assistant-sources">' + s.sources.map(src =>
      `<button type="button" class="assistant-source-chip" onclick="document.getElementById('btn-sources')?.click()">${escapeHtml(src.publisher)}${src.as_of_date ? ' · ' + escapeHtml(formatDisplayDate(src.as_of_date)) : ''}</button>`
    ).join('') + '</div>';
  }

  // 7. Next step
  if (s.next_step) {
    html += `<div style="margin-top:8px; font-size:0.8rem; color:var(--primary);">${escapeHtml(s.next_step)}</div>`;
  }

  // 8. Controls (Copy summary, Thumbs up/down, Report an issue)
  html += `
    <div class="assistant-controls">
      <div style="display:flex; gap:6px;">
        <button type="button" class="assistant-ctrl-btn btn-copy-summary">Copy summary</button>
        <button type="button" class="assistant-ctrl-btn btn-report-issue">Report an issue</button>
      </div>
      <div style="display:flex; gap:6px;">
        <button type="button" class="assistant-ctrl-btn btn-thumb" data-rating="up" title="Helpful">Helpful</button>
        <button type="button" class="assistant-ctrl-btn btn-thumb" data-rating="down" title="Not helpful">Not helpful</button>
      </div>
    </div>
  `;

  bubble.innerHTML = html;

  bubble.querySelector('.btn-copy-summary')?.addEventListener('click', (e) => {
    navigator.clipboard?.writeText(s.answer || '');
    e.target.textContent = 'Copied';
    setTimeout(() => { e.target.textContent = 'Copy summary'; }, 1500);
  });

  bubble.querySelectorAll('.btn-thumb').forEach(btn => {
    btn.addEventListener('click', async () => {
      const rating = btn.getAttribute('data-rating');
      bubble.querySelectorAll('.btn-thumb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await fetch('/api/assistant/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, rating })
      }).catch(() => {});
    });
  });

  bubble.querySelector('.btn-report-issue')?.addEventListener('click', async (e) => {
    e.target.textContent = 'Reported';
    e.target.disabled = true;
    await fetch('/api/assistant/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, rating: 'issue', comment: s.answer || '' })
    }).catch(() => {});
  });

  col.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
