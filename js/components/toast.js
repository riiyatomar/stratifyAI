// ========================================
// STRATIFY AI — Toast Notification System
// ========================================

const Toast = (() => {
  let container = null;

  function ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 4000) {
    const c = ensureContainer();

    const icons = {
      success: '✅',
      warning: '⚠️',
      danger: '❌',
      info: 'ℹ️',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    c.appendChild(toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  }

  function success(message, duration) { return show(message, 'success', duration); }
  function warning(message, duration) { return show(message, 'warning', duration); }
  function error(message, duration) { return show(message, 'danger', duration); }
  function info(message, duration) { return show(message, 'info', duration); }

  return { show, success, warning, error, info };
})();
