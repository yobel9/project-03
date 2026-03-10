// ============================================
// Church Admin - Settings Page (Simplified)
// ============================================

const Settings = {
    async render() {
        const isAdmin = await Auth.isAdmin();

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Pengaturan</h1>
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

            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Tentang Aplikasi</h3>
                </div>
                <div style="color: var(--text-secondary);">
                    <p><strong>GerejaKu Admin</strong> - Aplikasi Administrasi Gereja</p>
                    <p>Versi: 1.0.0</p>
                    <p style="margin-top: 10px;">Data disimpan secara lokal di browser (localStorage). Gunakan fitur backup untuk menjaga keamanan data Anda.</p>
                </div>
            </div>
        `;
    }
};
