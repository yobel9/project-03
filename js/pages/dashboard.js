// ============================================
// Church Admin - Dashboard Page
// ============================================

const Dashboard = {
    countdownTimer: null,
    balanceHidden: localStorage.getItem('dashboardBalanceHidden') === 'true',

    render() {
        this.clearCountdownTimer();

        const stats = AppData.getStats();
        const activeAnnouncements = AppData.getChurchAnnouncements()
            .filter((item) => item.status === 'published').length;
        const totalIncome = AppData.getDonations().reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const totalExpense = AppData.getExpenses().reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const totalBalance = totalIncome - totalExpense;
        const birthdayData = this.getBirthdayData();
        const activities = AppData.getActivities().slice(0, 5);
        const upcomingEvents = AppData.getEvents()
            .filter(e => e.status === 'upcoming')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        const importantEvents = upcomingEvents
            .filter((e) => e.priority === 'high')
            .slice(0, 4);
        const primaryImportantEvent = importantEvents[0] || null;
        const regularEvents = upcomingEvents
            .filter((e) => e.priority !== 'high')
            .slice(0, 4);

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
                    'Pengumuman Aktif',
                    activeAnnouncements,
                    '',
                    ''
                )}
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <span>Total Saldo</span>
                            <button class="btn-icon" style="width: 28px; height: 28px;" onclick="Dashboard.toggleBalanceVisibility()" title="${this.balanceHidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}">
                                ${this.balanceHidden
                                    ? '<svg viewBox="0 0 24 24" fill="none"><path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10.58 10.58A2 2 0 0 0 12 16c3.5 0 6.5-2 8-4-0.52-0.69-1.13-1.34-1.83-1.91M14.12 14.12A2 2 0 0 1 9.88 9.88M6.23 6.23C4.84 7.18 3.75 8.49 3 10c1.5 2 4.5 4 9 4 1.03 0 2-.11 2.91-.32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                                    : '<svg viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>'}
                            </button>
                        </div>
                        <div class="stat-value dashboard-balance-value ${this.balanceHidden ? 'masked' : ''}">${this.formatBalance(totalBalance)}</div>
                    </div>
                </div>
            </div>

            <!-- Countdown Full Width -->
            <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #1a365d 0%, #2c5282 60%, #2b6cb0 100%); color: #fff; overflow: hidden;">
                ${primaryImportantEvent ? `
                    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <div style="font-size: 0.85rem; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.06em;">Countdown Event Penting</div>
                            <div style="font-size: 1.5rem; font-weight: 700; margin-top: 4px;">${primaryImportantEvent.name}</div>
                            <div style="opacity: 0.92; margin-top: 6px; font-size: 0.95rem;">${Components.formatDate(primaryImportantEvent.date)} • ${Dashboard.formatEventTime(primaryImportantEvent)} • ${primaryImportantEvent.location}</div>
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="App.navigateTo('announcements-events')">Kelola Event</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(4, minmax(90px, 1fr)); gap: 12px;" id="eventCountdown" data-event-id="${primaryImportantEvent.id}">
                        <div style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px; text-align: center;">
                            <div id="countdownDays" style="font-size: 2rem; line-height: 1; font-weight: 800;">0</div>
                            <div style="font-size: 0.8rem; opacity: 0.9; margin-top: 6px;">Hari</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px; text-align: center;">
                            <div id="countdownHours" style="font-size: 2rem; line-height: 1; font-weight: 800;">0</div>
                            <div style="font-size: 0.8rem; opacity: 0.9; margin-top: 6px;">Jam</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px; text-align: center;">
                            <div id="countdownMinutes" style="font-size: 2rem; line-height: 1; font-weight: 800;">0</div>
                            <div style="font-size: 0.8rem; opacity: 0.9; margin-top: 6px;">Menit</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px; text-align: center;">
                            <div id="countdownSeconds" style="font-size: 2rem; line-height: 1; font-weight: 800;">0</div>
                            <div style="font-size: 0.8rem; opacity: 0.9; margin-top: 6px;">Detik</div>
                        </div>
                    </div>
                ` : `
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                        <div>
                            <div style="font-size: 0.85rem; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.06em;">Countdown Event Penting</div>
                            <div style="font-size: 1.25rem; font-weight: 700; margin-top: 6px;">Belum ada event prioritas tinggi</div>
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="App.navigateTo('announcements-events')">Tambah Event Penting</button>
                    </div>
                `}
            </div>

            <!-- Dashboard Grid -->
            <div class="dashboard-grid split-grid">
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
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Event Normal/Rendah</h3>
                        <button class="btn btn-sm btn-secondary" onclick="App.navigateTo('announcements-events')">Kelola Event</button>
                    </div>
                    <div class="event-list">
                        ${regularEvents.length > 0 ? regularEvents.map(event => {
                            const eventDate = new Date(event.date);
                            const priorityLabel = event.priority === 'low' ? 'Rendah' : 'Normal';
                            const priorityClass = event.priority === 'low' ? 'badge-info' : 'badge-warning';
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
                                                ${Dashboard.formatEventTime(event)}
                                            </span>
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none"><path d="M21 10C21 14.9706 16.9706 19 12 19C7.02944 19 3 14.9706 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" stroke-width="2"/><path d="M21 10V14M21 14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                                                ${event.location}
                                            </span>
                                            <span class="badge ${priorityClass}">${priorityLabel}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('') : `
                            <div class="empty-state" style="padding: 24px;">
                                <p style="color: var(--text-secondary);">Belum ada event normal/rendah</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3 class="card-title">Notifikasi Ulang Tahun Jemaat</h3>
                    <button class="btn btn-sm btn-secondary" onclick="App.navigateTo('members')">Lihat Jemaat</button>
                </div>
                <div class="birthday-grid">
                    <div style="background: var(--background); border-radius: var(--radius-lg); padding: 16px;">
                        <div style="font-weight: 700; margin-bottom: 10px; color: var(--accent);">Hari Ini</div>
                        ${birthdayData.today.length > 0 ? birthdayData.today.map((item) => `
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border);">
                                <div>
                                    <div style="font-weight: 600;">${item.name}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Ulang tahun ke-${item.newAge}</div>
                                </div>
                                <button class="btn btn-sm btn-secondary" onclick="Dashboard.sendBirthdayGreeting('${item.id}')">Kirim Ucapan</button>
                            </div>
                        `).join('') : `<div style="color: var(--text-secondary); font-size: 0.9rem;">Tidak ada ulang tahun hari ini.</div>`}
                    </div>
                    <div style="background: var(--background); border-radius: var(--radius-lg); padding: 16px;">
                        <div style="font-weight: 700; margin-bottom: 10px; color: var(--primary);">7 Hari Ke Depan</div>
                        ${birthdayData.upcoming.length > 0 ? birthdayData.upcoming.map((item) => `
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border);">
                                <div>
                                    <div style="font-weight: 600;">${item.name}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${item.labelDate} • ke-${item.newAge}</div>
                                </div>
                                <button class="btn btn-sm btn-secondary" onclick="Dashboard.sendBirthdayGreeting('${item.id}')">Siapkan Ucapan</button>
                            </div>
                        `).join('') : `<div style="color: var(--text-secondary); font-size: 0.9rem;">Tidak ada ulang tahun dalam 7 hari ke depan.</div>`}
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

        if (primaryImportantEvent) {
            this.startCountdown(primaryImportantEvent);
        }
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
    },

    formatEventTime(event) {
        if (!event.time && !event.endTime) return '-';
        if (event.time && event.endTime) return `${event.time} - ${event.endTime}`;
        return event.time || event.endTime;
    },

    formatBalance(amount) {
        if (this.balanceHidden) return 'Rp ••••••••';
        return `Rp ${AppData.formatCurrency(amount)}`;
    },

    toggleBalanceVisibility() {
        this.balanceHidden = !this.balanceHidden;
        localStorage.setItem('dashboardBalanceHidden', String(this.balanceHidden));
        this.render();
    },

    getBirthdayData() {
        const members = AppData.getMembers().filter((member) => member.birthDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const normalizeToCurrentYear = (birthDate) => {
            const source = new Date(birthDate);
            const date = new Date(now.getFullYear(), source.getMonth(), source.getDate());
            return Number.isNaN(date.getTime()) ? null : date;
        };

        const toDays = (date) => Math.floor((date.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

        const mapWithBirthdayMeta = members.map((member) => {
            const birthDate = new Date(member.birthDate);
            const nextBirthday = normalizeToCurrentYear(member.birthDate);
            if (!nextBirthday || Number.isNaN(birthDate.getTime())) return null;

            if (nextBirthday < today) {
                nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
            }

            const dayDiff = toDays(nextBirthday);
            const newAge = nextBirthday.getFullYear() - birthDate.getFullYear();

            return {
                id: member.id,
                name: member.name,
                phone: member.phone || '',
                dayDiff,
                newAge,
                labelDate: nextBirthday.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
            };
        }).filter(Boolean);

        return {
            today: mapWithBirthdayMeta.filter((item) => item.dayDiff === 0),
            upcoming: mapWithBirthdayMeta
                .filter((item) => item.dayDiff > 0 && item.dayDiff <= 7)
                .sort((a, b) => a.dayDiff - b.dayDiff)
        };
    },

    sendBirthdayGreeting(memberId) {
        const member = AppData.getMembers().find((item) => item.id === memberId);
        if (!member) return;

        const message = `Shalom ${member.name}, selamat ulang tahun. Tuhan Yesus memberkati selalu.`;
        const normalizedPhone = (member.phone || '').replace(/[^0-9]/g, '');
        const baseUrl = normalizedPhone ? `https://wa.me/${normalizedPhone}` : 'https://wa.me/';
        const url = `${baseUrl}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    },

    getCountdownLabel(eventDateString) {
        if (!eventDateString) return '-';
        const today = new Date();
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const eventDate = new Date(`${eventDateString}T00:00:00`);
        const diffMs = eventDate.getTime() - todayOnly.getTime();
        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

        if (diffDays < 0) return 'Lewat';
        if (diffDays === 0) return 'Hari ini';
        if (diffDays === 1) return 'Besok';
        return `D-${diffDays}`;
    },

    getEventDateTime(event) {
        if (!event || !event.date) return null;
        const time = event.time || '00:00';
        const dateTime = new Date(`${event.date}T${time}:00`);
        if (Number.isNaN(dateTime.getTime())) return null;
        return dateTime;
    },

    clearCountdownTimer() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    },

    startCountdown(event) {
        const target = this.getEventDateTime(event);
        if (!target) return;

        const updateCountdown = () => {
            const daysEl = document.getElementById('countdownDays');
            const hoursEl = document.getElementById('countdownHours');
            const minutesEl = document.getElementById('countdownMinutes');
            const secondsEl = document.getElementById('countdownSeconds');

            if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
                this.clearCountdownTimer();
                return;
            }

            const now = new Date();
            let diff = target.getTime() - now.getTime();
            if (diff < 0) diff = 0;

            const totalSeconds = Math.floor(diff / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            daysEl.textContent = String(days);
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
        };

        updateCountdown();
        this.countdownTimer = setInterval(updateCountdown, 1000);
    }
};
