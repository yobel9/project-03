// ============================================
// Church Admin - Church Announcements Page
// ============================================

const ChurchAnnouncements = {
    announcements: [],
    filteredAnnouncements: [],
    filters: {
        search: '',
        status: '',
        type: ''
    },

    typeLabels: {
        general: 'Umum',
        pastoral: 'Pastoral',
        other: 'Lainnya'
    },

    typeBadgeClass: {
        general: 'badge-info',
        pastoral: 'badge-warning',
        other: 'badge-success'
    },

    statusLabels: {
        draft: 'Draft',
        published: 'Dipublikasi'
    },

    statusBadgeClass: {
        draft: 'badge-warning',
        published: 'badge-success'
    },

    render() {
        this.announcements = AppData.getChurchAnnouncements();
        this.applyFilters();

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Pengumuman Gereja</h1>
                <button class="btn btn-primary" onclick="ChurchAnnouncements.showAddModal()">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    Tambah Pengumuman
                </button>
            </div>

            <div class="card">
                <div class="filters">
                    <div class="filter-group">
                        <label>Cari:</label>
                        <input id="churchAnnouncementSearchInput" type="text" class="form-input" placeholder="Judul atau isi pengumuman..." value="${this.filters.search}" oninput="ChurchAnnouncements.handleSearch(this.value)">
                    </div>
                    <div class="filter-group">
                        <label>Status:</label>
                        <select class="form-select" onchange="ChurchAnnouncements.handleStatusFilter(this.value)">
                            <option value="">Semua</option>
                            <option value="draft" ${this.filters.status === 'draft' ? 'selected' : ''}>Draft</option>
                            <option value="published" ${this.filters.status === 'published' ? 'selected' : ''}>Dipublikasi</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Tipe:</label>
                        <select class="form-select" onchange="ChurchAnnouncements.handleTypeFilter(this.value)">
                            <option value="">Semua</option>
                            <option value="general" ${this.filters.type === 'general' ? 'selected' : ''}>Umum</option>
                            <option value="pastoral" ${this.filters.type === 'pastoral' ? 'selected' : ''}>Pastoral</option>
                            <option value="other" ${this.filters.type === 'other' ? 'selected' : ''}>Lainnya</option>
                        </select>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table events-table">
                        <thead>
                            <tr>
                                <th>Judul</th>
                                <th>Tanggal</th>
                                <th>Tipe</th>
                                <th>Status</th>
                                <th>Ringkasan</th>
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
        const search = this.filters.search.toLowerCase();

        this.filteredAnnouncements = this.announcements.filter((item) => {
            const matchSearch = !search
                || (item.title || '').toLowerCase().includes(search)
                || (item.content || '').toLowerCase().includes(search);
            const matchStatus = !this.filters.status || item.status === this.filters.status;
            const matchType = !this.filters.type || item.type === this.filters.type;
            return matchSearch && matchStatus && matchType;
        });

        this.filteredAnnouncements.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    renderRows() {
        if (!this.filteredAnnouncements.length) {
            return `
                <tr>
                    <td colspan="6">
                        ${Components.emptyState(
                            '<svg viewBox="0 0 24 24" fill="none"><path d="M4 4H20V20H4V4Z" stroke="currentColor" stroke-width="2"/><path d="M8 8H16" stroke="currentColor" stroke-width="2"/><path d="M8 12H16" stroke="currentColor" stroke-width="2"/><path d="M8 16H13" stroke="currentColor" stroke-width="2"/></svg>',
                            'Belum Ada Pengumuman',
                            'Tambahkan pengumuman gereja agar informasi tersampaikan ke jemaat.',
                            'Tambah Pengumuman',
                            'ChurchAnnouncements.showAddModal()'
                        )}
                    </td>
                </tr>
            `;
        }

        return this.filteredAnnouncements.map((item) => `
            <tr>
                <td><strong>${item.title}</strong></td>
                <td>${Components.formatDate(item.date)}</td>
                <td><span class="badge ${this.typeBadgeClass[item.type] || 'badge-info'}">${this.typeLabels[item.type] || '-'}</span></td>
                <td><span class="badge ${this.statusBadgeClass[item.status] || 'badge-warning'}">${this.statusLabels[item.status] || '-'}</span></td>
                <td>${this.getSummary(item.content)}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="ChurchAnnouncements.showDetailModal('${item.id}')" title="Detail">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        <button class="action-btn" onclick="ChurchAnnouncements.shareToWhatsApp('${item.id}')" title="Share WhatsApp">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M20.5 11.5C20.5 16.1944 16.6944 20 12 20C10.5784 20 9.23831 19.6513 8.06047 19.0348L3.5 20.5L4.96518 15.9395C4.34869 14.7617 4 13.4216 4 12C4 7.30558 7.80558 3.5 12.5 3.5C17.1944 3.5 21 7.30558 21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <button class="action-btn edit" onclick="ChurchAnnouncements.showEditModal('${item.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        <button class="action-btn delete" onclick="ChurchAnnouncements.deleteAnnouncement('${item.id}')" title="Hapus">
                            <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                    </div>
                    <button class="btn btn-sm btn-secondary" style="margin-top: 8px;" onclick="ChurchAnnouncements.togglePublishStatus('${item.id}')">
                        ${item.status === 'published' ? 'Kembalikan ke Draft' : 'Publikasikan'}
                    </button>
                </td>
            </tr>
        `).join('');
    },

    getSummary(text = '') {
        if (!text) return '-';
        if (text.length <= 90) return text;
        return `${text.slice(0, 90)}...`;
    },

    handleSearch(value) {
        this.filters.search = value;
        this.applyFilters();
        this.render();
        Components.preserveInputFocus('churchAnnouncementSearchInput', value);
    },

    handleStatusFilter(value) {
        this.filters.status = value;
        this.applyFilters();
        this.render();
    },

    handleTypeFilter(value) {
        this.filters.type = value;
        this.applyFilters();
        this.render();
    },

    getFormHtml(item = {}) {
        return `
            <form id="churchAnnouncementForm">
                <input type="hidden" name="id" value="${item.id || ''}">
                <div class="form-group">
                    <label class="form-label required">Judul Pengumuman</label>
                    <input type="text" class="form-input" name="title" value="${item.title || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Tanggal</label>
                        <input type="date" class="form-input" name="date" value="${item.date || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Tipe</label>
                        <select class="form-select" name="type" required>
                            <option value="">Pilih...</option>
                            <option value="general" ${item.type === 'general' ? 'selected' : ''}>Umum</option>
                            <option value="pastoral" ${item.type === 'pastoral' ? 'selected' : ''}>Pastoral</option>
                            <option value="other" ${item.type === 'other' ? 'selected' : ''}>Lainnya</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label required">Isi Pengumuman</label>
                    <textarea class="form-textarea" name="content" rows="5" required>${item.content || ''}</textarea>
                </div>
            </form>
        `;
    },

    showAddModal() {
        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="ChurchAnnouncements.saveAnnouncement()">Simpan</button>
        `;

        Components.modal('Tambah Pengumuman Gereja', this.getFormHtml(), footerHtml);
    },

    showEditModal(id) {
        const item = this.announcements.find((entry) => entry.id === id);
        if (!item) return;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="ChurchAnnouncements.saveAnnouncement()">Simpan Perubahan</button>
        `;

        Components.modal('Edit Pengumuman Gereja', this.getFormHtml(item), footerHtml);
    },

    saveAnnouncement() {
        const form = document.getElementById('churchAnnouncementForm');
        const formData = Object.fromEntries(new FormData(form).entries());

        if (!formData.title || !formData.date || !formData.type || !formData.content) {
            Components.toast('Semua field wajib harus diisi.', 'error');
            return;
        }

        const payload = {
            title: formData.title,
            date: formData.date,
            type: formData.type,
            status: formData.id ? undefined : 'draft',
            content: formData.content
        };

        if (payload.status === undefined) {
            delete payload.status;
        }

        if (formData.id) {
            AppData.updateChurchAnnouncement(formData.id, payload);
            Components.toast('Pengumuman berhasil diperbarui.', 'success');
        } else {
            AppData.addChurchAnnouncement(payload);
            Components.toast('Pengumuman berhasil ditambahkan.', 'success');
        }

        Components.closeModal();
        this.render();
    },

    deleteAnnouncement(id) {
        const item = this.announcements.find((entry) => entry.id === id);
        if (!item) return;

        Components.confirm(
            'Hapus Pengumuman',
            `Yakin ingin menghapus \"${item.title}\"?`,
            () => {
                AppData.deleteChurchAnnouncement(id);
                Components.toast('Pengumuman berhasil dihapus.', 'success');
                this.render();
            }
        );
    },

    showDetailModal(id) {
        const item = this.announcements.find((entry) => entry.id === id);
        if (!item) return;

        const bodyHtml = `
            <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Judul</span><span>${item.title}</span></div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Tanggal</span><span>${Components.formatDate(item.date)}</span></div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Tipe</span><span>${this.typeLabels[item.type] || '-'}</span></div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary);">Status</span><span>${this.statusLabels[item.status] || '-'}</span></div>
                <div style="padding: 10px; background: var(--background); border-radius: var(--radius);"><span style="color: var(--text-secondary); display: block; margin-bottom: 6px;">Isi Pengumuman</span><span>${item.content}</span></div>
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
            <button class="btn btn-secondary" onclick="ChurchAnnouncements.togglePublishStatus('${item.id}')">${item.status === 'published' ? 'Kembalikan ke Draft' : 'Publikasikan'}</button>
            <button class="btn btn-secondary" onclick="ChurchAnnouncements.shareToWhatsApp('${item.id}')">Share WA</button>
            <button class="btn btn-primary" onclick="Components.closeModal(); ChurchAnnouncements.showEditModal('${item.id}')">Edit</button>
        `;

        Components.modal('Detail Pengumuman Gereja', bodyHtml, footerHtml);
    },

    composeShareMessage(item) {
        return [
            `*PENGUMUMAN GEREJA*`,
            `${item.title}`,
            `Tanggal: ${Components.formatDate(item.date)}`,
            '',
            `${item.content}`
        ].join('\n');
    },

    shareToWhatsApp(id) {
        const item = this.announcements.find((entry) => entry.id === id);
        if (!item) return;

        if (item.status !== 'published') {
            AppData.updateChurchAnnouncement(id, { status: 'published' });
            item.status = 'published';
            Components.toast('Status pengumuman otomatis diubah ke Dipublikasi.', 'success');
            this.render();
        }

        const message = this.composeShareMessage(item);
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    },

    togglePublishStatus(id) {
        const item = this.announcements.find((entry) => entry.id === id);
        if (!item) return;

        const nextStatus = item.status === 'published' ? 'draft' : 'published';
        AppData.updateChurchAnnouncement(id, { status: nextStatus });
        Components.toast(
            nextStatus === 'published' ? 'Pengumuman dipublikasi.' : 'Pengumuman dikembalikan ke draft.',
            'success'
        );
        this.render();
    }
};
