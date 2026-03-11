// ============================================
// Church Admin - Worship Schedule Page
// ============================================

const WorshipSchedule = {
    schedules: [],
    filteredSchedules: [],
    filters: {
        search: '',
        category: ''
    },

    dayLabels: {
        Sunday: 'Minggu',
        Monday: 'Senin',
        Tuesday: 'Selasa',
        Wednesday: 'Rabu',
        Thursday: 'Kamis',
        Friday: 'Jumat',
        Saturday: 'Sabtu'
    },

    categoryLabels: {
        routine: 'Rutin Mingguan',
        flexible: 'Berkala/Fleksibel',
        special: 'Khusus/Undangan'
    },

    categoryBadgeClass: {
        routine: 'badge-info',
        flexible: 'badge-warning',
        special: 'badge-success'
    },

    async render() {
        this.schedules = AppData.getWorshipSchedules();
        this.applyFilters();

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Jadwal Ibadah</h1>
                <button class="btn btn-primary" onclick="WorshipSchedule.showAddModal()">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    Tambah Jadwal
                </button>
            </div>

            <div class="card">
                <div class="filters">
                    <div class="filter-group">
                        <label>Cari:</label>
                        <input id="worshipScheduleSearchInput" type="text" class="form-input" placeholder="Nama ibadah atau lokasi..." value="${this.filters.search}" oninput="WorshipSchedule.handleSearch(this.value)">
                    </div>
                    <div class="filter-group">
                        <label>Kategori:</label>
                        <select class="form-select" onchange="WorshipSchedule.handleCategoryFilter(this.value)">
                            <option value="">Semua</option>
                            <option value="routine" ${this.filters.category === 'routine' ? 'selected' : ''}>Rutin Mingguan</option>
                            <option value="flexible" ${this.filters.category === 'flexible' ? 'selected' : ''}>Berkala/Fleksibel</option>
                            <option value="special" ${this.filters.category === 'special' ? 'selected' : ''}>Khusus/Undangan</option>
                        </select>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table events-table">
                        <thead>
                            <tr>
                                <th>Nama Ibadah</th>
                                <th>Kategori</th>
                                <th>Jadwal</th>
                                <th>Lokasi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    applyFilters() {
        const searchText = this.filters.search.toLowerCase();
        this.filteredSchedules = this.schedules.filter((item) => {
            const matchCategory = !this.filters.category || item.category === this.filters.category;
            const matchSearch = !searchText
                || (item.name || '').toLowerCase().includes(searchText)
                || (item.location || '').toLowerCase().includes(searchText)
                || (item.notes || '').toLowerCase().includes(searchText);
            return matchCategory && matchSearch;
        });
    },

    renderRows() {
        const canDelete = Auth.canDelete();
        if (!this.filteredSchedules.length) {
            return `
                <tr>
                    <td colspan="5">
                        ${Components.emptyState(
                            '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/></svg>',
                            'Belum Ada Jadwal Ibadah',
                            'Tambahkan jadwal ibadah rutin, fleksibel, atau khusus.',
                            'Tambah Jadwal',
                            'WorshipSchedule.showAddModal()'
                        )}
                    </td>
                </tr>
            `;
        }

        return this.filteredSchedules.map((item) => `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td><span class="badge ${this.categoryBadgeClass[item.category] || 'badge-info'}">${this.categoryLabels[item.category] || '-'}</span></td>
                <td>
                    <div>${this.formatSchedule(item)}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${this.formatTimeRange(item)}</div>
                </td>
                <td>${item.location || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="WorshipSchedule.showDetailModal('${item.id}')" title="Detail">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        <button class="action-btn" onclick="WorshipSchedule.shareToWhatsApp('${item.id}')" title="Share WhatsApp">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M20.5 11.5C20.5 16.1944 16.6944 20 12 20C10.5784 20 9.23831 19.6513 8.06047 19.0348L3.5 20.5L4.96518 15.9395C4.34869 14.7617 4 13.4216 4 12C4 7.30558 7.80558 3.5 12.5 3.5C17.1944 3.5 21 7.30558 21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <button class="action-btn edit" onclick="WorshipSchedule.showEditModal('${item.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        ${canDelete ? `
                            <button class="action-btn delete" onclick="WorshipSchedule.deleteSchedule('${item.id}')" title="Hapus">
                                <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    handleSearch(value) {
        this.filters.search = value;
        this.applyFilters();
        
        // Debounce render to prevent cursor jumping
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        this.searchDebounceTimer = setTimeout(() => {
            this.render();
            Components.preserveInputFocus('worshipScheduleSearchInput', value);
        }, 150);
    },

    handleCategoryFilter(value) {
        this.filters.category = value;
        this.applyFilters();
        this.render();
    },

    formatSchedule(item) {
        if (item.category === 'routine') {
            return this.dayLabels[item.dayOfWeek] || '-';
        }
        if (item.date) {
            return Components.formatDate(item.date);
        }
        return '-';
    },

    formatTimeRange(item) {
        if (!item.startTime && !item.endTime) return '-';
        if (item.startTime && item.endTime) return `${item.startTime} - ${item.endTime}`;
        return item.startTime || item.endTime;
    },

    getNextDateForDay(dayOfWeek) {
        const dayMap = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6
        };

        const target = dayMap[dayOfWeek];
        if (target === undefined) return '';

        const today = new Date();
        const currentDay = today.getDay();
        let delta = target - currentDay;
        if (delta < 0) delta += 7;

        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + delta);

        return nextDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    getFormHtml(item = {}) {
        return `
            <form id="worshipScheduleForm">
                <input type="hidden" name="id" value="${item.id || ''}">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Kategori</label>
                        <select class="form-select" name="category" onchange="WorshipSchedule.handleFormCategoryChange(this.value)" required>
                            <option value="">Pilih...</option>
                            <option value="routine" ${item.category === 'routine' ? 'selected' : ''}>Rutin Mingguan</option>
                            <option value="flexible" ${item.category === 'flexible' ? 'selected' : ''}>Berkala/Fleksibel</option>
                            <option value="special" ${item.category === 'special' ? 'selected' : ''}>Khusus/Undangan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Nama Ibadah</label>
                        <input type="text" class="form-input" name="name" value="${item.name || ''}" placeholder="Contoh: Ibadah Raya" required>
                    </div>
                </div>
                <div class="form-row" id="dayRow">
                    <div class="form-group">
                        <label class="form-label">Hari (untuk rutin)</label>
                        <select class="form-select" name="dayOfWeek">
                            <option value="">Pilih Hari...</option>
                            <option value="Sunday" ${item.dayOfWeek === 'Sunday' ? 'selected' : ''}>Minggu</option>
                            <option value="Monday" ${item.dayOfWeek === 'Monday' ? 'selected' : ''}>Senin</option>
                            <option value="Tuesday" ${item.dayOfWeek === 'Tuesday' ? 'selected' : ''}>Selasa</option>
                            <option value="Wednesday" ${item.dayOfWeek === 'Wednesday' ? 'selected' : ''}>Rabu</option>
                            <option value="Thursday" ${item.dayOfWeek === 'Thursday' ? 'selected' : ''}>Kamis</option>
                            <option value="Friday" ${item.dayOfWeek === 'Friday' ? 'selected' : ''}>Jumat</option>
                            <option value="Saturday" ${item.dayOfWeek === 'Saturday' ? 'selected' : ''}>Sabtu</option>
                        </select>
                    </div>
                    <div class="form-group" id="dateGroup">
                        <label class="form-label">Tanggal (untuk fleksibel/khusus)</label>
                        <input type="date" class="form-input" name="date" value="${item.date || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Waktu Mulai</label>
                        <input type="time" class="form-input" name="startTime" value="${item.startTime || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Waktu Selesai</label>
                        <input type="time" class="form-input" name="endTime" value="${item.endTime || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Lokasi</label>
                        <input type="text" class="form-input" name="location" value="${item.location || ''}" required>
                    </div>
                </div>
                <div class="form-group" id="invitationGroup">
                    <label class="form-label">Cakupan Undangan</label>
                    <input type="text" class="form-input" name="invitationNote" value="${item.invitationNote || ''}" placeholder="Contoh: Undangan keluarga inti">
                </div>
                <div class="form-group" id="recurrenceGroup">
                    <label class="form-label">Catatan Pola (khusus fleksibel)</label>
                    <input type="text" class="form-input" name="recurrenceNote" value="${item.recurrenceNote || ''}" placeholder="Contoh: Minggu ke-2 dan ke-4 (opsional)">
                </div>
                <div class="form-group">
                    <label class="form-label">Susunan Petugas (untuk Share WA)</label>
                    <textarea class="form-textarea" name="serviceDetails" rows="7" placeholder="Liturgi  : ...&#10;Singer  : ...&#10;Khotbah : ...">${item.serviceDetails || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-textarea" name="notes" rows="2">${item.notes || ''}</textarea>
                </div>
            </form>
        `;
    },

    handleFormCategoryChange(category) {
        this.syncFormFields(category);
    },

    syncFormFields(categoryFromChange = '') {
        const form = document.getElementById('worshipScheduleForm');
        if (!form) return;

        const category = categoryFromChange || form.category.value;
        const dateGroup = document.getElementById('dateGroup');
        const recurrenceGroup = document.getElementById('recurrenceGroup');
        const invitationGroup = document.getElementById('invitationGroup');
        const daySelect = form.dayOfWeek;
        const dateInput = form.date;

        if (dateGroup) {
            dateGroup.style.display = category === 'routine' ? 'none' : 'block';
        }
        if (recurrenceGroup) {
            recurrenceGroup.style.display = category === 'flexible' ? 'block' : 'none';
        }
        if (invitationGroup) {
            invitationGroup.style.display = category === 'special' ? 'block' : 'none';
        }

        if (category === 'routine') {
            daySelect.required = true;
            dateInput.required = false;
        } else {
            daySelect.required = false;
            dateInput.required = true;
        }
    },

    showAddModal() {
        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="WorshipSchedule.saveSchedule()">Simpan</button>
        `;
        Components.modal('Tambah Jadwal Ibadah', this.getFormHtml(), footerHtml);
        this.syncFormFields();
    },

    showEditModal(id) {
        const item = this.schedules.find((entry) => entry.id === id);
        if (!item) return;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="WorshipSchedule.saveSchedule()">Simpan Perubahan</button>
        `;
        Components.modal('Edit Jadwal Ibadah', this.getFormHtml(item), footerHtml);
        this.syncFormFields(item.category);
    },

    buildPayload(formData) {
        return {
            name: formData.name,
            category: formData.category,
            dayOfWeek: formData.category === 'routine' ? formData.dayOfWeek : '',
            date: formData.category === 'routine' ? '' : formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            location: formData.location,
            recurrenceNote: formData.category === 'flexible' ? formData.recurrenceNote : '',
            invitationNote: formData.category === 'special' ? formData.invitationNote : '',
            serviceDetails: formData.serviceDetails || '',
            notes: formData.notes
        };
    },

    saveSchedule() {
        const form = document.getElementById('worshipScheduleForm');
        const formData = Object.fromEntries(new FormData(form).entries());

        if (!formData.category || !formData.name || !formData.startTime || !formData.location) {
            Components.toast('Kategori, nama, waktu mulai, dan lokasi wajib diisi.', 'error');
            return;
        }

        if (formData.category === 'routine' && !formData.dayOfWeek) {
            Components.toast('Hari wajib diisi untuk jadwal rutin.', 'error');
            return;
        }

        if (formData.category !== 'routine' && !formData.date) {
            Components.toast('Tanggal wajib diisi untuk jadwal fleksibel/khusus.', 'error');
            return;
        }

        const payload = this.buildPayload(formData);

        if (formData.id) {
            AppData.updateWorshipSchedule(formData.id, payload);
            Components.toast('Jadwal ibadah berhasil diperbarui.', 'success');
        } else {
            AppData.addWorshipSchedule(payload);
            Components.toast('Jadwal ibadah berhasil ditambahkan.', 'success');
        }

        Components.closeModal();
        this.render();
    },

    deleteSchedule(id) {
        if (!Auth.canDelete()) {
            Components.toast('Hanya admin yang dapat menghapus data.', 'warning');
            return;
        }
        const item = this.schedules.find((entry) => entry.id === id);
        if (!item) return;

        Components.confirm(
            'Hapus Jadwal Ibadah',
            `Yakin ingin menghapus ${item.name}?`,
            () => {
                AppData.deleteWorshipSchedule(id);
                Components.toast('Jadwal ibadah berhasil dihapus.', 'success');
                this.render();
            }
        );
    },

    showDetailModal(id) {
        const item = this.schedules.find((entry) => entry.id === id);
        if (!item) return;

        const bodyHtml = `
            <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Nama Ibadah</span><span>${item.name}</span></div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Kategori</span><span>${this.categoryLabels[item.category] || '-'}</span></div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Jadwal</span><span>${this.formatSchedule(item)}</span></div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Waktu</span><span>${this.formatTimeRange(item)}</span></div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Lokasi</span><span>${item.location || '-'}</span></div>
                ${item.recurrenceNote ? `<div style="padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary); display: block; margin-bottom: 4px;">Catatan Pola</span><span>${item.recurrenceNote}</span></div>` : ''}
                ${item.invitationNote ? `<div style="padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary); display: block; margin-bottom: 4px;">Cakupan Undangan</span><span>${item.invitationNote}</span></div>` : ''}
                ${item.serviceDetails ? `<div style="padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary); display: block; margin-bottom: 4px;">Susunan Petugas</span><pre style="margin: 0; white-space: pre-wrap; font-family: inherit;">${item.serviceDetails}</pre></div>` : ''}
                <div style="padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary); display: block; margin-bottom: 4px;">Catatan</span><span>${item.notes || '-'}</span></div>
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
            <button class="btn btn-secondary" onclick="WorshipSchedule.shareToWhatsApp('${item.id}')">Share WA</button>
            <button class="btn btn-primary" onclick="Components.closeModal(); WorshipSchedule.showEditModal('${item.id}')">Edit</button>
        `;

        Components.modal('Detail Jadwal Ibadah', bodyHtml, footerHtml);
    },

    composeShareMessage(item) {
        const titleDate = item.date
            ? new Date(item.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            : this.getNextDateForDay(item.dayOfWeek);

        const lines = [
            `*${(item.name || 'Ibadah').toUpperCase()}, ${titleDate}*`
        ];

        lines.push(`Waktu: ${this.formatTimeRange(item)}`);
        lines.push(`Lokasi: ${item.location || '-'}`);
        if (item.serviceDetails && item.serviceDetails.trim()) {
            lines.push('');
            lines.push(item.serviceDetails.trim());
            return lines.join('\n');
        }

        if (item.invitationNote) lines.push(`Cakupan Undangan: ${item.invitationNote}`);
        if (item.recurrenceNote) lines.push(`Catatan Pola: ${item.recurrenceNote}`);
        if (item.notes) lines.push(`Catatan: ${item.notes}`);
        return lines.join('\n');
    },

    shareToWhatsApp(id) {
        const item = this.schedules.find((entry) => entry.id === id);
        if (!item) return;

        const message = this.composeShareMessage(item);
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};
