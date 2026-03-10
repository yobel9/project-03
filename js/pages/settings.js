// ============================================
// Church Admin - Settings Page
// ============================================

const Settings = {
    render() {
        const isAdmin = Auth.isAdmin();
        const storageMode = StorageService.getMode();
        const dbConfig = StorageService.getDatabaseConfig();
        const autoSyncEnabled = StorageService.isAutoSyncEnabled();
        const autoPullEnabled = StorageService.isAutoPullEnabled();
        const autoPullIntervalSec = StorageService.getAutoPullIntervalSec();
        const syncMeta = StorageService.getSyncMeta();
        const formatSyncTime = (iso) => {
            if (!iso) return '-';
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return '-';
            return d.toLocaleString('id-ID');
        };

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Pengaturan</h1>
            </div>

            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Mode Penyimpanan</h3>
                </div>
                ${isAdmin ? `
                    <div class="form-group">
                        <label class="form-label">Pilih Mode</label>
                        <select id="storageModeSelect" class="form-select">
                            <option value="local" ${storageMode === 'local' ? 'selected' : ''}>Local (Stabil)</option>
                            <option value="database" ${storageMode === 'database' ? 'selected' : ''}>Database Ready (Persiapan)</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Provider</label>
                            <input id="dbProviderInput" type="text" class="form-input" value="${dbConfig.provider || 'supabase'}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Table/Collection</label>
                            <input id="dbTableInput" type="text" class="form-input" value="${dbConfig.table || 'app_storage'}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Database URL (placeholder)</label>
                        <input id="dbUrlInput" type="text" class="form-input" value="${dbConfig.url || ''}" placeholder="https://xxxx.supabase.co">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Anon Key (placeholder)</label>
                        <input id="dbAnonKeyInput" type="password" class="form-input" value="${dbConfig.anonKey || ''}" placeholder="eyJ...">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Auto Push saat Data Berubah</label>
                            <select id="autoSyncSelect" class="form-select">
                                <option value="false" ${!autoSyncEnabled ? 'selected' : ''}>Off</option>
                                <option value="true" ${autoSyncEnabled ? 'selected' : ''}>On</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Auto Pull saat Startup</label>
                            <select id="autoPullSelect" class="form-select">
                                <option value="false" ${!autoPullEnabled ? 'selected' : ''}>Off</option>
                                <option value="true" ${autoPullEnabled ? 'selected' : ''}>On</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Interval Auto Pull (detik)</label>
                            <select id="autoPullIntervalSelect" class="form-select">
                                <option value="15" ${autoPullIntervalSec === 15 ? 'selected' : ''}>15 detik</option>
                                <option value="30" ${autoPullIntervalSec === 30 ? 'selected' : ''}>30 detik</option>
                                <option value="45" ${autoPullIntervalSec === 45 ? 'selected' : ''}>45 detik</option>
                                <option value="60" ${autoPullIntervalSec === 60 ? 'selected' : ''}>60 detik</option>
                            </select>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 14px;">
                        Catatan: mode Database masih tahap transisi. Simpan backup sebelum mengaktifkan auto sync.
                    </p>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button class="btn btn-primary" onclick="Settings.saveStorageSettings()">Simpan Pengaturan Storage</button>
                        <button class="btn btn-secondary" onclick="Settings.pullSharedStorageSettings()">Tarik Pengaturan Shared</button>
                    </div>
                    <p style="color: var(--text-muted); margin-top: 10px; font-size: 0.86rem;">
                        Pengaturan mode/auto sync bisa dishare antar device via database. URL dan anon key tetap perlu diisi per device.
                    </p>
                ` : `
                    <p style="color: var(--text-secondary); margin: 0;">
                        Pengaturan mode penyimpanan hanya tersedia untuk akun admin.
                    </p>
                `}
            </div>

            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Sinkronisasi Database (Manual)</h3>
                </div>
                ${isAdmin ? `
                    <div style="display:grid; gap:8px; margin-bottom: 14px; font-size: 0.9rem;">
                        <div><strong>Status Local:</strong> ${syncMeta.dirty ? '<span style="color: var(--warning);">Belum tersinkron</span>' : '<span style="color: var(--accent);">Sinkron</span>'}</div>
                        <div><strong>Perubahan Lokal Terakhir:</strong> ${formatSyncTime(syncMeta.lastLocalChangeAt)}</div>
                        <div><strong>Push Terakhir:</strong> ${formatSyncTime(syncMeta.lastPushAt)}</div>
                        <div><strong>Pull Terakhir:</strong> ${formatSyncTime(syncMeta.lastPullAt)}</div>
                        <div><strong>Error Terakhir:</strong> ${syncMeta.lastError || '-'}</div>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 14px;">
                        Gunakan fitur ini untuk uji koneksi dan sinkron data lokal dengan Supabase secara manual selama fase development.
                    </p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="Settings.testDbConnection()">Test Koneksi DB</button>
                        <button class="btn btn-secondary" onclick="Settings.pushToDatabase()">Push Local ke DB</button>
                        <button class="btn btn-primary" onclick="Settings.pullFromDatabase()">Pull DB ke Local</button>
                    </div>
                    <p style="color: var(--text-muted); margin-top: 10px; font-size: 0.86rem;">
                        Catatan: tabel Supabase yang dipakai harus punya kolom: <code>id</code> (text, primary key), <code>payload</code> (jsonb), <code>updated_at</code> (timestamptz).
                    </p>
                ` : `
                    <p style="color: var(--text-secondary); margin: 0;">
                        Sinkronisasi database hanya tersedia untuk akun admin.
                    </p>
                `}
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Backup & Restore Data</h3>
                </div>
                ${isAdmin ? `
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">
                        Gunakan backup untuk menyimpan seluruh data aplikasi ke file JSON, dan restore untuk memulihkan data dari file backup.
                    </p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="App.exportBackup()">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V3M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                            Backup Data
                        </button>
                        <button class="btn btn-primary" onclick="App.triggerRestore()">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                            Restore Data
                        </button>
                    </div>
                ` : `
                    <p style="color: var(--text-secondary); margin: 0;">
                        Fitur backup/restore hanya tersedia untuk akun admin.
                    </p>
                `}
            </div>
        `;
    },

    async saveStorageSettings() {
        if (!Auth.isAdmin()) {
            Components.toast('Hanya admin yang dapat mengubah pengaturan storage.', 'warning');
            return;
        }

        const mode = document.getElementById('storageModeSelect')?.value || 'local';
        const url = (document.getElementById('dbUrlInput')?.value || '').trim();
        const anonKey = (document.getElementById('dbAnonKeyInput')?.value || '').trim();
        const table = (document.getElementById('dbTableInput')?.value || '').trim() || 'app_storage';
        const autoSync = document.getElementById('autoSyncSelect')?.value === 'true';
        const autoPull = document.getElementById('autoPullSelect')?.value === 'true';
        const autoPullIntervalSec = parseInt(document.getElementById('autoPullIntervalSelect')?.value || '45', 10);

        try {
            StorageService.setDatabaseConfig({
                provider: 'supabase',
                url,
                anonKey,
                table
            });
            StorageService.setMode(mode);
            StorageService.setAutoSyncEnabled(autoSync);
            StorageService.setAutoPullEnabled(autoPull);
            StorageService.setAutoPullIntervalSec(autoPullIntervalSec);

            if (StorageService.getMode() === 'database' && StorageService.isDatabaseConfigReady()) {
                await StorageService.pushSharedStorageSettings();
            }

            if (window.App && typeof window.App.startBackgroundSync === 'function') {
                window.App.startBackgroundSync();
            }

            Components.toast('Pengaturan storage disimpan.', 'success');
            this.render();
        } catch (error) {
            Components.toast(`Gagal simpan pengaturan shared: ${error.message}`, 'error');
            this.render();
        }
    },

    async pullSharedStorageSettings() {
        if (!Auth.isAdmin()) {
            Components.toast('Hanya admin yang dapat menarik pengaturan shared.', 'warning');
            return;
        }

        try {
            const result = await StorageService.pullSharedStorageSettings();
            if (!result.found) {
                Components.toast('Pengaturan shared belum ada di database.', 'info');
                return;
            }

            if (window.App && typeof window.App.startBackgroundSync === 'function') {
                window.App.startBackgroundSync();
            }

            Components.toast('Pengaturan shared berhasil diterapkan.', 'success');
            this.render();
        } catch (error) {
            Components.toast(`Gagal tarik pengaturan shared: ${error.message}`, 'error');
        }
    },

    async testDbConnection() {
        try {
            await StorageService.testDatabaseConnection();
            Components.toast('Koneksi database berhasil.', 'success');
            this.render();
        } catch (error) {
            Components.toast(`Koneksi database gagal: ${error.message}`, 'error');
            this.render();
        }
    },

    async pushToDatabase() {
        try {
            await StorageService.pushLocalDataToDatabase('churchAdminData');
            Components.toast('Push data lokal ke database berhasil.', 'success');
            this.render();
        } catch (error) {
            Components.toast(`Push gagal: ${error.message}`, 'error');
            this.render();
        }
    },

    async pullFromDatabase() {
        const syncMeta = StorageService.getSyncMeta();
        if (syncMeta.dirty) {
            const bodyHtml = `
                <p style="margin:0;color:var(--text-secondary);">
                    Ada perubahan lokal yang belum tersinkron. Pull sekarang akan menimpa data lokal. Lanjutkan?
                </p>
            `;
            const footerHtml = `
                <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
                <button class="btn btn-danger" onclick="Components.closeModal(); Settings.forcePullFromDatabase()">Force Pull</button>
            `;
            Components.modal('Konfirmasi Force Pull', bodyHtml, footerHtml);
            return;
        }
        await this.forcePullFromDatabase(false);
    },

    async forcePullFromDatabase(force = true) {
        try {
            const result = await StorageService.pullDatabaseDataToLocal('churchAdminData', { force });
            if (result.changed) {
                AppData.init();
                Components.toast('Pull data dari database berhasil. Halaman akan dimuat ulang.', 'success');
                setTimeout(() => window.location.reload(), 500);
                return;
            }
            Components.toast('Tidak ada perubahan baru di database.', 'info');
            this.render();
        } catch (error) {
            Components.toast(`Pull gagal: ${error.message}`, 'error');
            this.render();
        }
    }
};
