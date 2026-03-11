// ============================================
// Church Admin - Main Application
// ============================================

const App = {
    currentPage: 'dashboard',
    sidebarMinimized: false,
    backgroundPullTimer: null,
    backgroundPullRunning: false,
    loadedScripts: new Set(),
    pages: {
        dashboard: { title: 'Dashboard', script: 'dashboard', render: () => Dashboard.render() },
        members: { title: 'Data Jemaat', script: 'members', render: () => Members.render() },
        'commissions-all': { title: 'Semua Komisi', script: 'commissions', render: () => Commissions.render('all') },
        'commissions-sunday-school': { title: 'Komisi Sekolah Minggu', script: 'commissions', render: () => Commissions.render('sunday_school') },
        'commissions-youth': { title: 'Komisi Pemuda Remaja', script: 'commissions', render: () => Commissions.render('youth') },
        'commissions-men': { title: 'Komisi Pria', script: 'commissions', render: () => Commissions.render('men') },
        'commissions-women': { title: 'Komisi Wanita', script: 'commissions', render: () => Commissions.render('women') },
        attendance: { title: 'Struktur Pengurus', script: 'attendance', render: () => Attendance.render() },
        finance: { title: 'Keuangan', script: 'finance', render: () => Finance.render() },
        inventory: { title: 'Inventaris Gereja', script: 'inventory', render: () => Inventory.render() },
        users: { title: 'Manajemen User', script: 'users', render: () => Users.render() },
        settings: { title: 'Pengaturan', script: 'settings', render: () => Settings.render() },
        'announcements-schedule': { title: 'Jadwal Ibadah', script: 'worship-schedule', render: () => WorshipSchedule.render() },
        'announcements-events': { title: 'Event', script: 'events', render: () => Events.render() },
        'announcements-church': { title: 'Pengumuman Gereja', script: 'church-announcements', render: () => ChurchAnnouncements.render() },
        events: { title: 'Event', script: 'events', render: () => Events.render() }
    },

    // Lazy load page script
    async loadPageScript(scriptName) {
        if (!scriptName || this.loadedScripts.has(scriptName)) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/pages/${scriptName}.js`;
            script.async = true;
            script.onload = () => {
                this.loadedScripts.add(scriptName);
                console.log(`Loaded: ${scriptName}.js`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Failed to load: ${scriptName}.js`);
                reject(new Error(`Failed to load ${scriptName}.js`));
            };
            document.head.appendChild(script);
        });
    },

    async init() {
        if (!await Auth.requireAuth()) return;
        this.sidebarMinimized = localStorage.getItem('sidebarMinimized') === 'true';
        
        // Apply saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        // Load app settings (church name, logo) - run early to update UI
        this.loadAppSettings();
        
        // Preload dashboard script for faster initial load
        await this.loadPageScript('dashboard');
        
        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch((error) => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
        
        this.setupNavigation();
        this.setupSidebar();
        this.setupUserActions();
        await this.updateCurrentUserProfile();
        
        await this.loadPage('dashboard');
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const label = item.querySelector('span')?.textContent?.trim() || '';
            if (label) {
                item.dataset.tooltip = label;
                item.title = label;
            }

            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (!page) return;
                this.loadPage(page);
            });
        });
    },

    setupSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarMinimize = document.getElementById('sidebarMinimize');
        const headerFullscreen = document.getElementById('headerFullscreen');

        this.applySidebarState();

        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
        });

        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });

        if (sidebarMinimize) {
            sidebarMinimize.addEventListener('click', () => {
                this.sidebarMinimized = !this.sidebarMinimized;
                localStorage.setItem('sidebarMinimized', String(this.sidebarMinimized));
                this.applySidebarState();
            });
        }

        // Fullscreen toggle (in header)
        if (headerFullscreen) {
            headerFullscreen.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });

        window.addEventListener('resize', () => {
            this.applySidebarState();
        });
    },

    applySidebarState() {
        const isMobile = window.innerWidth <= 768;
        const isMinimized = !isMobile && this.sidebarMinimized;
        document.body.classList.toggle('sidebar-minimized', isMinimized);

        const sidebarMinimize = document.getElementById('sidebarMinimize');
        if (sidebarMinimize) {
            sidebarMinimize.title = isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar';
        }
    },

    // Toggle fullscreen mode
    toggleFullscreen() {
        const fullscreenBtn = document.getElementById('headerFullscreen');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen().then(() => {
                document.body.classList.add('fullscreen-mode');
                if (fullscreenBtn) {
                    fullscreenBtn.title = 'Exit Fullscreen';
                    fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;
                }
            }).catch(err => {
                console.error('Error enabling fullscreen:', err);
                Components.toast('Tidak dapat masuk fullscreen', 'error');
            });
        } else {
            // Exit fullscreen
            document.exitFullscreen().then(() => {
                document.body.classList.remove('fullscreen-mode');
                if (fullscreenBtn) {
                    fullscreenBtn.title = 'Fullscreen';
                    fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;
                }
            });
        }
    },

    toggleCommissionMenu() {
        const group = document.getElementById('commissionNavGroup');
        if (!group) return;
        group.classList.toggle('open');
    },

    toggleAnnouncementMenu() {
        const group = document.getElementById('announcementNavGroup');
        if (!group) return;
        group.classList.toggle('open');
    },

    setupUserActions() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (event) => {
                event.preventDefault();
                Auth.logout();
            });
        }
    },

    async updateCurrentUserProfile() {
        const user = await Auth.getCurrentUser();
        if (!user) return;
        const nameEl = document.getElementById('sidebarUserName');
        const roleEl = document.getElementById('sidebarUserRole');
        const avatarEl = document.getElementById('sidebarUserAvatar');

        if (nameEl) nameEl.textContent = user.name || user.username;
        if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrator' : 'Staff';
        if (avatarEl) avatarEl.textContent = (user.name || user.username || 'U').slice(0, 1).toUpperCase();

        const usersNav = document.querySelector('.nav-item[data-page="users"]')?.closest('li');
        if (usersNav) {
            usersNav.style.display = user.role === 'admin' ? '' : 'none';
        }
    },

    async loadPage(pageName) {
        if (!(await Auth.isAuthenticated())) {
            Auth.renderLogin();
            return;
        }
        const user = await Auth.getCurrentUser();
        if (pageName === 'users' && user?.role !== 'admin') {
            Components.toast('Hanya admin yang bisa akses manajemen user.', 'warning');
            return;
        }
        const pageConfig = this.pages[pageName];
        if (!pageConfig) return;

        this.currentPage = pageName;
        
        // Update page title
        document.getElementById('pageTitle').textContent = pageConfig.title;
        
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        const commissionGroup = document.getElementById('commissionNavGroup');
        if (commissionGroup) {
            const isCommissionPage = pageName.startsWith('commissions-');
            commissionGroup.classList.toggle('active', isCommissionPage);
            commissionGroup.classList.toggle('open', isCommissionPage);
        }

        const announcementGroup = document.getElementById('announcementNavGroup');
        if (announcementGroup) {
            const isAnnouncementPage = pageName.startsWith('announcements-');
            announcementGroup.classList.toggle('active', isAnnouncementPage);
            announcementGroup.classList.toggle('open', isAnnouncementPage);
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }

        // Lazy load page script
        if (pageConfig.script) {
            await this.loadPageScript(pageConfig.script);
        }

        pageConfig.render();
    },

    // Utility to navigate to a page
    navigateTo(pageName) {
        this.loadPage(pageName);
    },

    async exportBackup() {
        if (!(await Auth.isAdmin())) {
            Components.toast('Hanya admin yang dapat backup data.', 'warning');
            return;
        }

        const payload = {
            app: 'GerejaKu Admin',
            version: 1,
            exportedAt: new Date().toISOString(),
            data: AppData.getData()
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-gerejaku-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        Components.toast('Backup data berhasil diunduh.', 'success');
    },

    async triggerRestore() {
        if (!(await Auth.isAdmin())) {
            Components.toast('Hanya admin yang dapat restore data.', 'warning');
            return;
        }
        const input = document.getElementById('restoreInput');
        if (!input) return;
        input.value = '';
        input.click();
    },

    async handleRestoreFile(event) {
        if (!(await Auth.isAdmin())) {
            Components.toast('Hanya admin yang dapat restore data.', 'warning');
            return;
        }

        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                const candidate = parsed && typeof parsed === 'object' && parsed.data ? parsed.data : parsed;
                const requiredKeys = ['members', 'donations', 'expenses', 'events', 'activities'];
                const isValid = requiredKeys.every((key) => Array.isArray(candidate?.[key]));

                if (!isValid) {
                    Components.toast('File backup tidak valid.', 'error');
                    return;
                }

                const bodyHtml = '<p style="margin:0;color:var(--text-secondary);">Restore akan menimpa semua data saat ini. Lanjutkan?</p>';
                const footerHtml = `
                    <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
                    <button class="btn btn-primary" onclick="App.confirmRestore()">Restore</button>
                `;
                window.__restoreCandidateData = candidate;
                Components.modal('Restore Data', bodyHtml, footerHtml);
            } catch (error) {
                Components.toast('Gagal membaca file backup.', 'error');
            }
        };
        reader.readAsText(file);
    },

    confirmRestore() {
        if (!window.__restoreCandidateData) return;
        AppData.saveData(window.__restoreCandidateData);
        AppData.init();
        window.__restoreCandidateData = null;
        Components.closeModal();
        Components.toast('Restore data berhasil. Halaman akan dimuat ulang.', 'success');
        setTimeout(() => window.location.reload(), 500);
    },
    
    // Load app settings (church name, logo)
    loadAppSettings() {
        try {
            // Get saved values from localStorage
            const churchName = localStorage.getItem('churchName') || '';
            const churchShortName = localStorage.getItem('churchShortName') || churchName;
            const churchLogo = localStorage.getItem('churchLogo') || '';
            
            console.log('loadAppSettings - churchName:', churchName);
            console.log('loadAppSettings - churchShortName:', churchShortName);
            console.log('loadAppSettings - churchLogo exists:', !!churchLogo);
            
            // If no saved settings, use defaults
            if (!churchName && !churchShortName && !churchLogo) {
                console.log('No saved settings found');
                return;
            }
            
            // Use short name for sidebar, full name for title
            const displayName = churchShortName || churchName || 'GerejaKu';
            
            // Update sidebar text - find all possible elements
            const sidebarLogo = document.getElementById('sidebarLogo');
            console.log('sidebarLogo element:', sidebarLogo);
            
            if (sidebarLogo) {
                const logoText = sidebarLogo.querySelector('.logo-text');
                if (logoText) {
                    logoText.textContent = displayName;
                    console.log('Updated sidebar text to:', displayName);
                }
            }
            
            // Update document title (use full name)
            const fullName = churchName || 'GerejaKu';
            document.title = fullName + ' Admin';
            
            // Update logo in sidebar
            if (churchLogo) {
                // Try to find the image element in sidebar
                const logoImg = document.querySelector('#sidebarLogo img');
                const logoSvg = document.querySelector('#sidebarLogo svg');
                
                console.log('logoImg element:', logoImg);
                console.log('logoSvg element:', logoSvg);
                
                if (logoImg) {
                    logoImg.src = churchLogo;
                    logoImg.style.display = 'block';
                    if (logoSvg) logoSvg.style.display = 'none';
                    console.log('Updated logo image');
                } else {
                    // Create img element if it doesn't exist
                    const newImg = document.createElement('img');
                    newImg.src = churchLogo;
                    newImg.alt = 'Logo';
                    newImg.className = 'logo-icon';
                    newImg.style.cssText = 'width: 32px; height: 32px; border-radius: 8px; object-fit: cover; display: block;';
                    
                    if (logoSvg && logoSvg.parentNode) {
                        logoSvg.parentNode.insertBefore(newImg, logoSvg);
                    } else if (sidebarLogo) {
                        sidebarLogo.appendChild(newImg);
                    }
                    console.log('Created new logo image element');
                }
            }
        } catch (e) {
            console.error('Error in loadAppSettings:', e);
        }
    },
    
    // Update app settings
    updateAppSettings(settings) {
        if (settings.churchName) {
            localStorage.setItem('churchName', settings.churchName);
            const logoText = document.getElementById('logoText');
            if (logoText) logoText.textContent = settings.churchName;
            document.title = settings.churchName + ' Admin';
        }
        
        if (settings.churchLogo) {
            localStorage.setItem('churchLogo', settings.churchLogo);
            const logoImage = document.getElementById('logoImage');
            const logoSvg = document.getElementById('logoSvg');
            if (logoImage && logoSvg) {
                logoImage.src = settings.churchLogo;
                logoImage.style.display = 'block';
                logoSvg.style.display = 'none';
            }
        }
        
        return true;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Make App globally accessible for onclick handlers
    window.App = App;

    Promise.resolve(App.init()).then(() => {
        console.log('Church Admin App initialized successfully');
    }).catch((error) => {
        console.error('Error initializing app:', error);
        document.getElementById('content').innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <h3>Error Loading Application</h3>
                <p>Please check browser console for details: ${error.message}</p>
            </div>
        `;
    });
});
