// ============================================
// Church Admin - Settings Page
// ============================================

const Settings = {
    async render() {
        const isAdmin = await Auth.isAdmin();
        const isDark = localStorage.getItem('theme') === 'dark';
        
        // Get saved settings
        const churchName = localStorage.getItem('churchName') || 'GerejaKu';
        const churchShortName = localStorage.getItem('churchShortName') || '';
        const churchLogo = localStorage.getItem('churchLogo') || '';
        
        // Get Supabase config
        const supabaseConfig = StorageService.getDatabaseConfig();

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Pengaturan</h1>
            </div>

            <!-- Informasi Gereja -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Informasi Gereja</h3>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 16px;">
                    Ubah nama dan logo gereja yang ditampilkan di aplikasi.
                </p>
                
                <div class="form-group">
                    <label class="form-label">Nama Gereja</label>
                    <input type="text" id="churchNameInput" class="form-input" value="${churchName}" placeholder="Nama Gereja">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Nama Singkat (untuk Sidebar)</label>
                    <input type="text" id="churchShortNameInput" class="form-input" value="${churchShortName}" placeholder="Contoh: GerejaKu">
                    <small style="color: var(--text-secondary);">Nama singkat yang tampil di sidebar. Kalau kosong, pakai nama lengkap.</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Logo Gereja</label>
                    <input type="file" id="churchLogoInput" class="form-input" accept="image/*">
                    <small style="color: var(--text-secondary);">Unggah gambar (JPG, PNG). Ukuran disarankan 512x512.</small>
                    ${churchLogo ? `
                        <div style="margin-top: 10px;">
                            <img src="${churchLogo}" alt="Logo Saat Ini" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border);">
                            <button class="btn btn-secondary" style="margin-left: 10px;" onclick="Settings.removeLogo()">Hapus Logo</button>
                        </div>
                    ` : ''}
                </div>
                
                <button class="btn btn-primary" onclick="Settings.saveChurchInfo()">
                    <svg viewBox="0 0 24 24" fill="none" style="width: 18px; height: 18px; margin-right: 8px;"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Simpan
                </button>
            </div>

            <!-- Tampilan -->
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Tampilan</h3>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 16px;">
                    Pengaturan tampilan aplikasi.
                </p>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--background); border-radius: var(--radius);">
                    <div>
                        <strong>Mode Gelap (Dark Mode)</strong>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-secondary);">
                            Aktifkan tema gelap untuk kenyamanan mata.
                        </p>
                    </div>
                    <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
                        <input type="checkbox" id="darkModeToggle" ${isDark ? 'checked' : ''} onchange="Settings.toggleDarkMode()" style="opacity: 0; width: 0; height: 0;">
                        <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-dark); transition: 0.3s; border-radius: 28px;">
                            <span style="position: absolute; content: ''; height: 22px; width: 22px; left: 3px; bottom: 3px; background-color: white; transition: 0.3s; border-radius: 50%; ${isDark ? 'transform: translateX(24px);' : ''}"></span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Database (Supabase) -->
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Database (Supabase)</h3>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 16px;">
                    Sambungkan ke Supabase untuk menyimpan data di cloud.
                </p>
                
                <div class="form-group">
                    <label class="form-label">Supabase URL</label>
                    <input type="text" id="supabaseUrlInput" class="form-input" value="${supabaseConfig.url || ''}" placeholder="https://xxxxx.supabase.co">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Anon Key</label>
                    <input type="text" id="supabaseAnonKeyInput" class="form-input" value="${supabaseConfig.anonKey || ''}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                    <small style="color: var(--text-secondary);">Dapatkan dari Project Settings > API > anon public</small>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button class="btn btn-primary" onclick="Settings.saveSupabaseConfig()">
                        <svg viewBox="0 0 24 24" fill="none" style="width: 18px; height: 18px; margin-right: 8px;"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Sambungkan
                    </button>
                    <button class="btn btn-secondary" onclick="Settings.testSupabaseConnection()">
                        Test Koneksi
                    </button>
                </div>
                
                ${supabaseConfig.url ? `
                    <div style="margin-top: 16px; padding: 12px; background: var(--success-bg, #dcfce7); border-radius: var(--radius); border: 1px solid var(--success, #22c55e);">
                        <div style="display: flex; align-items: center; gap: 8px; color: var(--success, #16a34a);">
                            <svg viewBox="0 0 24 24" fill="none" style="width: 20px; height: 20px;"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <strong>Status: Terhubung</strong>
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Backup & Restore Data -->
            <div class="card" style="margin-top: 20px;">
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

            <!-- Tentang Aplikasi -->
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Tentang Aplikasi</h3>
                </div>
                <div style="color: var(--text-secondary);">
                    <p><strong>${churchName} Admin</strong> - Aplikasi Administrasi Gereja</p>
                    <p>Versi: 1.0.0</p>
                    <p style="margin-top: 10px;">Data disimpan secara lokal di browser (localStorage). Gunakan fitur backup untuk menjaga keamanan data Anda.</p>
                </div>
            </div>
        `;
        
        // Apply current theme
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    },
    
    toggleDarkMode() {
        const checkbox = document.getElementById('darkModeToggle');
        const isDark = checkbox.checked;
        
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    },
    
    async saveChurchInfo() {
        const nameInput = document.getElementById('churchNameInput');
        const shortNameInput = document.getElementById('churchShortNameInput');
        const logoInput = document.getElementById('churchLogoInput');
        
        const churchName = nameInput.value.trim();
        const churchShortName = shortNameInput ? shortNameInput.value.trim() : '';
        
        if (!churchName) {
            Components.toast('Nama gereja tidak boleh kosong!', 'error');
            return;
        }
        
        // Save church name
        localStorage.setItem('churchName', churchName);
        localStorage.setItem('churchShortName', churchShortName);
        
        // Update UI immediately - use short name for sidebar, full name for title
        const displayName = churchShortName || churchName;
        const logoText = document.getElementById('logoText');
        if (logoText) logoText.textContent = displayName;
        document.title = churchName + ' Admin';
        
        // Handle logo upload
        if (logoInput && logoInput.files && logoInput.files[0]) {
            const file = logoInput.files[0];
            
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                Components.toast('Ukuran gambar maksimal 2MB!', 'error');
                return;
            }
            
            // Convert to base64
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result;
                localStorage.setItem('churchLogo', base64);
                
                // Update logo in sidebar immediately
                const logoContainer = document.getElementById('sidebarLogo');
                if (logoContainer) {
                    let img = logoContainer.querySelector('img');
                    let svg = logoContainer.querySelector('svg');
                    
                    if (!img) {
                        img = document.createElement('img');
                        img.id = 'logoImage';
                        img.className = 'logo-icon';
                        img.style.cssText = 'width: 32px; height: 32px; border-radius: 8px; object-fit: cover; display: block;';
                        img.alt = 'Logo';
                        if (svg) svg.parentNode.insertBefore(img, svg);
                    }
                    
                    img.src = base64;
                    img.style.display = 'block';
                    if (svg) svg.style.display = 'none';
                }
                
                Components.toast('Informasi gereja berhasil disimpan!', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            Components.toast('Informasi gereja berhasil disimpan!', 'success');
        }
    },
    
    removeLogo() {
        localStorage.removeItem('churchLogo');
        
        // Update logo immediately
        const logoImage = document.getElementById('logoImage');
        const logoSvg = document.getElementById('logoSvg');
        if (logoImage && logoSvg) {
            logoImage.style.display = 'none';
            logoSvg.style.display = 'block';
        }
        
        Components.toast('Logo berhasil dihapus!', 'success');
        
        // Re-render to update the UI
        this.render();
    },

    saveSupabaseConfig() {
        const urlInput = document.getElementById('supabaseUrlInput');
        const anonKeyInput = document.getElementById('supabaseAnonKeyInput');
        
        const url = urlInput?.value?.trim();
        const anonKey = anonKeyInput?.value?.trim();
        
        if (!url) {
            Components.toast('Mohon masukkan URL Supabase', 'warning');
            return;
        }
        
        if (!anonKey) {
            Components.toast('Mohon masukkan Anon Key', 'warning');
            return;
        }
        
        // Save to storage
        StorageService.setDatabaseConfig({ url, anonKey });
        StorageService.setMode('database');
        
        Components.toast('Konfigurasi Supabase disimpan. Menguji koneksi...', 'success');
        
        // Test connection
        this.testSupabaseConnection();
    },

    async testSupabaseConnection() {
        try {
            Components.toast('Menguji koneksi ke Supabase...', 'info');
            
            const result = await StorageService.testDatabaseConnection();
            
            if (result) {
                Components.toast('Koneksi ke Supabase berhasil!', 'success');
                // Push local data to database
                try {
                    await StorageService.pushLocalDataToDatabase();
                    Components.toast('Data lokal berhasil di-sync ke Supabase', 'success');
                } catch (e) {
                    console.warn('Push data failed:', e.message);
                }
            }
        } catch (error) {
            Components.toast(`Koneksi gagal: ${error.message}`, 'error');
            // Revert to local mode
            StorageService.setMode('local');
        }
    }
};
