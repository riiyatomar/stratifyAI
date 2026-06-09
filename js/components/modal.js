// ========================================
// STRATIFY AI — Modal Component
// ========================================

const Modal = (() => {
  function show({ title, content, actions = [], size = 'default' }) {
    // Remove existing modal
    close();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    const maxWidth = size === 'large' ? '720px' : size === 'small' ? '400px' : '560px';

    overlay.innerHTML = `
      <div class="modal-content" style="max-width: ${maxWidth}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body" id="modal-body">
          ${content}
        </div>
        ${actions.length > 0 ? `
          <div class="modal-footer" id="modal-footer">
            ${actions.map(a => `
              <button class="btn ${a.class || 'btn-secondary'}" id="${a.id || ''}" ${a.disabled ? 'disabled' : ''}>
                ${a.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    // Close handlers
    document.getElementById('modal-close-btn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Bind action handlers
    actions.forEach(action => {
      if (action.id && action.onClick) {
        const btn = document.getElementById(action.id);
        if (btn) btn.addEventListener('click', action.onClick);
      }
    });

    // Focus trap
    document.addEventListener('keydown', handleEscKey);

    return overlay;
  }

  function close() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.remove();
    document.removeEventListener('keydown', handleEscKey);
  }

  function handleEscKey(e) {
    if (e.key === 'Escape') close();
  }

  function confirm({ title, message, confirmLabel = 'Confirm', confirmClass = 'btn-primary', onConfirm }) {
    return show({
      title,
      content: `<p style="color: var(--text-secondary); line-height: 1.6;">${message}</p>`,
      actions: [
        { label: 'Cancel', class: 'btn-secondary', id: 'modal-cancel', onClick: close },
        { label: confirmLabel, class: confirmClass, id: 'modal-confirm', onClick: () => { close(); if (onConfirm) onConfirm(); } },
      ],
    });
  }

  return { show, close, confirm };
})();
