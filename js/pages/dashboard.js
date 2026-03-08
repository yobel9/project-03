// ============================================
// Church Admin - Dashboard Page
// ============================================

const Dashboard = {
    render() {
        const stats = AppData.getStats();
        const activities = AppData.getActivities().slice(0, 5);
        const events = AppData.getEvents()
            .filter(e => e.status === 'upcoming')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);

        const today = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('id-ID', dateOptions);

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="welcome-banner" style="margin-bottom: 32px;">
                <h2 style="margin-bottom: 8px;">Selamat Datang! 🕊️</h2>
                <p style="color: var(--text-secondary); margin: 0;">${formattedDate}</p>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                ${Components.statCard(
                    { type: 'primary', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    'Total Jemaat Aktif',
                    stats.totalMembers,
                    '',
                    ''
                )}
                ${Components.statCard(
                    { type: 'accent', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M19 8V14M19 11H16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    'Jemaat Baru Bulan Ini',
                    stats.newMembersThisMonth,
                    '',
                    ''
                )}
                ${Components.statCard(
                    { type: 'warning', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    'Kehadiran Minggu Ini',
                    stats.attendanceCount,
                    '',
                    ''
                )}
                ${Components.statCard(
                    { type: 'danger', svg: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
                    'Donasi Bulan Ini',
                    'Rp ' + AppData.formatCurrency(stats.donationsThisMonth),
                    '',
                    ''
                )}
            </div>

            <!-- Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Recent Activities -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Aktivitas Terbaru</h3>
                        <button class="btn btn-sm btn-secondary" onclick="App.navigateTo('members')">Lihat Semua</button>
                    </div>
                    <ul class="activity-list">
                        ${activities.map(activity => `
                            <li class="activity-item">
                                <div class="activity-icon ${activity.type}">
                                    ${Dashboard.getActivityIcon(activity.type)}
                                </div>
                                <div class="activity-content">
                                    <div class="activity-text"><strong>${activity.title}</strong></div>
                                    <div class="activity-text" style="color: var(--text-secondary); font-size: 0.857rem;">${activity.description}</div>
                                    <div class="activity-time">${Dashboard.formatTimeAgo(activity.timestamp)}</div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Upcoming Events -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Acara Mendatang</h3>
                        <button class="btn btn-sm btn-secondary" onclick="App.navigateTo('announcements-events')">Lihat Semua</button>
                    </div>
                    <div class="event-list">
                        ${events.length > 0 ? events.map(event => {
                            const eventDate = new Date(event.date);
                            return `
                                <div class="event-card">
                                    <div class="event-date">
                                        <span class="day">${eventDate.getDate()}</span>
                                        <span class="month">${eventDate.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                    </div>
                                    <div class="event-info">
                                        <div class="event-name">${event.name}</div>
                                        <div class="event-meta">
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                                                ${event.time}
                                            </span>
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none"><path d="M21 10C21 14.9706 16.9706 19 12 19C7.02944 19 3 14.9706 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" stroke-width="2"/><path d="M21 10V14M21 14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                                                ${event.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('') : `
                            <div class="empty-state" style="padding: 24px;">
                                <p style="color: var(--text-secondary);">Tidak ada acara mendatang</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">Aksi Cepat</h3>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="Members.showAddModal()">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M19 8V14M19 11H16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Tambah Jemaat
                    </button>
                    <button class="btn btn-secondary" onclick="App.navigateTo('attendance')">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Input Kehadiran
                    </button>
                    <button class="btn btn-secondary" onclick="App.navigateTo('finance')">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 1V23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Input Donasi
                    </button>
                    <button class="btn btn-secondary" onclick="App.navigateTo('announcements-events')">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Buat Acara
                    </button>
                </div>
            </div>
        `;
    },

    getActivityIcon(type) {
        const icons = {
            member: '<svg viewBox="0 0 24 24" fill="none"><path d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>',
            donation: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 1V23" stroke="currentColor" stroke-width="2"/><path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/></svg>',
            event: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/></svg>'
        };
        return icons[type] || icons.member;
    },

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        if (days < 7) return `${days} hari yang lalu`;
        
        return time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
};
