// ============================================
// Church Admin - Main Application
// ============================================

const App = {
    currentPage: 'dashboard',
    sidebarMinimized: false,
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
        'announcements-schedule': { title: 'Jadwal Ibadah', render: () => WorshipSchedule.render() },
        'announcements-events': { title: 'Event', render: () => Events.render() },
        'announcements-church': { title: 'Pengumuman Gereja', render: () => Events.render() },
        events: { title: 'Event', render: () => Events.render() }
    },

    init() {
        this.sidebarMinimized = localStorage.getItem('sidebarMinimized') === 'true';
        this.setupNavigation();
        this.setupSidebar();
        this.loadPage('dashboard');
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

    loadPage(pageName) {
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
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        App.init();
        console.log('Church Admin App initialized successfully');
        
        // Make App globally accessible for onclick handlers
        window.App = App;
    } catch (error) {
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
    }
});
