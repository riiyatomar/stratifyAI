// ========================================
// STRATIFY AI — Settings Page
// ========================================

const SettingsPage = (() => {
  async function render(container) {
    const settings = await Store.getSettings();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-top">
          <div>
            <h1 class="page-title">Settings</h1>
            <p class="page-subtitle">Configure Stratify AI preferences</p>
          </div>
        </div>
      </div>

      <!-- General Settings -->
      <div class="glass-card-static settings-section">
        <h4 class="settings-section-title">⚙️ General</h4>
        <div class="settings-group">
          <div class="settings-row">
            <div class="settings-label-group">
              <div class="settings-label">Company Name</div>
              <div class="settings-desc">Your company name used in proposals</div>
            </div>
            <input type="text" class="input-field" id="setting-company" value="${settings.companyName}" style="max-width: 250px;">
          </div>

          <div class="settings-row">
            <div class="settings-label-group">
              <div class="settings-label">Default Hourly Rate</div>
              <div class="settings-desc">Used for cost estimation in proposals</div>
            </div>
            <input type="number" class="input-field" id="setting-rate" value="${settings.defaultRate}" style="max-width: 120px;">
          </div>

          <div class="settings-row">
            <div class="settings-label-group">
              <div class="settings-label">Currency</div>
              <div class="settings-desc">Default currency for estimates</div>
            </div>
            <select class="select-field" id="setting-currency" style="max-width: 120px;">
              <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD</option>
              <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR</option>
              <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>GBP</option>
              <option value="INR" ${settings.currency === 'INR' ? 'selected' : ''}>INR</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div class="glass-card-static settings-section">
        <h4 class="settings-section-title">🎨 Preferences</h4>
        <div class="settings-group">
          <div class="settings-row">
            <div class="settings-label-group">
              <div class="settings-label">Auto Save</div>
              <div class="settings-desc">Automatically save changes as you work</div>
            </div>
            <div class="toggle ${settings.autoSave === true || settings.autoSave === 'true' ? 'active' : ''}" id="toggle-autosave" data-key="autoSave"></div>
          </div>

          <div class="settings-row">
            <div class="settings-label-group">
              <div class="settings-label">Notifications</div>
              <div class="settings-desc">Show toast notifications for actions</div>
            </div>
            <div class="toggle ${settings.notifications === true || settings.notifications === 'true' ? 'active' : ''}" id="toggle-notifications" data-key="notifications"></div>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="glass-card-static settings-section">
        <h4 class="settings-section-title">💾 Data Management</h4>
        <div class="settings-group">
          <div class="settings-row">
            <div class="settings-label-group">
              <div class="settings-label">Load Demo Data</div>
              <div class="settings-desc">Pre-load sample projects to explore the system</div>
            </div>
            <button class="btn btn-secondary" id="load-demo">📦 Load Demo Data</button>
          </div>

          <div class="settings-row">
            <div class="settings-label-group">
              <div class="settings-label">Export Data</div>
              <div class="settings-desc">Download all projects as JSON</div>
            </div>
            <button class="btn btn-secondary" id="export-data">📥 Export JSON</button>
          </div>

          <div class="settings-row">
            <div class="settings-label-group">
              <div class="settings-label text-danger">Clear All Data</div>
              <div class="settings-desc">Permanently delete all projects and settings</div>
            </div>
            <button class="btn btn-danger" id="clear-data">🗑️ Clear All</button>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div style="display: flex; justify-content: flex-end; margin-top: var(--space-4);">
        <button class="btn btn-primary btn-lg" id="save-settings">💾 Save Settings</button>
      </div>
    `;

    // Events
    document.getElementById('save-settings')?.addEventListener('click', saveSettings);
    document.getElementById('load-demo')?.addEventListener('click', loadDemo);
    document.getElementById('export-data')?.addEventListener('click', exportData);
    document.getElementById('clear-data')?.addEventListener('click', clearData);

    // Toggles
    document.querySelectorAll('.toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
      });
    });
  }

  async function saveSettings() {
    const updates = {
      companyName: document.getElementById('setting-company')?.value || 'Your Company',
      defaultRate: parseInt(document.getElementById('setting-rate')?.value) || 100,
      currency: document.getElementById('setting-currency')?.value || 'USD',
      autoSave: document.getElementById('toggle-autosave')?.classList.contains('active'),
      notifications: document.getElementById('toggle-notifications')?.classList.contains('active'),
    };

    await Store.updateSettings(updates);
    Toast.success('Settings saved successfully!');
  }

  async function loadDemo() {
    await Store.seedDemoData();
    await Sidebar.refresh();
    Toast.success('Demo data loaded! Check the Dashboard.');
  }

  async function exportData() {
    const projects = await Store.getProjects();
    const settings = await Store.getSettings();
    const data = { projects, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stratify-ai-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Data exported successfully!');
  }

  function clearData() {
    Modal.confirm({
      title: 'Clear All Data',
      message: 'This will permanently delete all projects, proposals, and settings. This action cannot be undone.',
      confirmLabel: 'Clear Everything',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        Store.clearAll();
        await Sidebar.refresh();
        Toast.success('All data cleared.');
        Router.navigate('dashboard');
      },
    });
  }

  return { render };
})();
