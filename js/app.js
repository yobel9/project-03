// ============================================
// Church Admin - Main Application
// ============================================

const App = {
    currentPage: 'dashboard',
    sidebarMinimized: false,
    backgroundPullTimer: null,
    backgroundPullRunning: false,
    pages: {
        dashboard: { title: 'Dashboard', render: () => Dashboard.render() },
        members: { title: 'Data Jemaat', render: () => Members.render() },
        'commissions-all': { title: 'Semua Komisi', render: () => Commissions.render('all') },
        'commissions-sunday-school': { title: 'Komisi Sekolah Minggu', render: () => Commissions.render('sunday_school') },
        'commissions-youth': { title: 'Komisi Pemuda Remaja', render: () => Commissions.render('youth') },
        'commissions-men': { title: 'Komisi Pria', render: () => Commissions.render('men') },
        'commissions-women': { title: 'Komisi Wanita', render: () => Commissions.render('women') },
        attendance: { title: 'Struktur Pengurus', render: () => Attendance.render() },
        finance: { title: 'Keuangan', render: () => Finance.render() },
        inventory: { title: 'Inventaris Gereja', render: () => Inventory.render() },
        users: { title: 'Manajemen User', render: () => Users.render() },
        settings: { title: 'Pengaturan', render: () => Settings.render() },
        'announcements-schedule': { title: 'Jadwal Ibadah', render: () => WorshipSchedule.render() },
        'announcements-events': { title: 'Event', render: () => Events.render() },
        'announcements-church': { title: 'Pengumuman Gereja', render: () => ChurchAnnouncements.render() },
        events: { title: 'Event', render: () => Events.render() }
    },

    async init() {
        if (!Auth.requireAuth()) return;
        this.sidebarMinimized = localStorage.getItem('sidebarMinimized') === 'true';
        this.setupNavigation();
        this.setupSidebar();
        this.setupUserActions();
        this.updateCurrentUserProfile();

        // Pull shared storage settings from DB so other devices can follow admin config.
        const sharedSettings = await StorageService.autoApplySharedStorageSettings();
        if (sharedSettings.applied) {
            this.applySidebarState();
        }

        // Optional startup sync from database mode (safe no-op in local mode).
        const startupSync = await StorageService.autoPullOnStartup('churchAdminData');
        if (startupSync.pulled && startupSync.changed) {
            AppData.init();
            Components.toast('Data terbaru berhasil dimuat dari database.', 'success');
        } else if (startupSync.reason === 'local_dirty') {
            Components.toast('Auto pull dilewati karena ada perubahan lokal yang belum tersinkron.', 'warning');
        }

        this.loadPage('dashboard');
        this.startBackgroundSync();
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
                this.stopBackgroundSync();
                Auth.logout();
            });
        }
    },

    startBackgroundSync() {
        this.stopBackgroundSync();

        const shouldRun = StorageService.getMode() === 'database'
            && StorageService.isAutoPullEnabled()
            && StorageService.isDatabaseConfigReady();
        if (!shouldRun) return;

        const intervalMs = StorageService.getAutoPullIntervalSec() * 1000;
        this.backgroundPullTimer = setInterval(async () => {
            if (this.backgroundPullRunning || !Auth.isAuthenticated()) return;

            this.backgroundPullRunning = true;
            try {
                const result = await StorageService.autoPullOnStartup('churchAdminData');
                if (result.pulled && result.changed) {
                    AppData.init();
                    this.loadPage(this.currentPage);
                    Components.toast('Data baru tersinkron dari database.', 'info');
                }
            } finally {
                this.backgroundPullRunning = false;
            }
        }, intervalMs);
    },

    stopBackgroundSync() {
        if (this.backgroundPullTimer) {
            clearInterval(this.backgroundPullTimer);
            this.backgroundPullTimer = null;
        }
        this.backgroundPullRunning = false;
    },

    updateCurrentUserProfile() {
        const user = Auth.getCurrentUser();
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

    loadPage(pageName) {
        if (!Auth.isAuthenticated()) {
            Auth.renderLogin();
            return;
        }
        const user = Auth.getCurrentUser();
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

        pageConfig.render();
    },

    // Utility to navigate to a page
    navigateTo(pageName) {
        this.loadPage(pageName);
    },

    exportBackup() {
        if (!Auth.isAdmin()) {
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

    triggerRestore() {
        if (!Auth.isAdmin()) {
            Components.toast('Hanya admin yang dapat restore data.', 'warning');
            return;
        }
        const input = document.getElementById('restoreInput');
        if (!input) return;
        input.value = '';
        input.click();
    },

    handleRestoreFile(event) {
        if (!Auth.isAdmin()) {
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
