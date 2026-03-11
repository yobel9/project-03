// ============================================
// Church Admin - Organization Structure Page
// ============================================

var Attendance = {
    structure: [],
    filters: {
        search: ''
    },

    async render() {
        this.structure = AppData.getStructure();
        const filtered = this.getFiltered();
        const canDelete = await Auth.canDelete();

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Struktur Pengurus Gereja</h1>
                <div class="finance-header-actions">
                    <button class="btn btn-secondary" onclick="Attendance.printStructure()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2"/><path d="M6 18H5A2 2 0 0 1 3 16V11A2 2 0 0 1 5 9H19A2 2 0 0 1 21 11V16A2 2 0 0 1 19 18H18" stroke="currentColor" stroke-width="2"/><rect x="6" y="14" width="12" height="8" stroke="currentColor" stroke-width="2"/></svg>
                        Cetak Struktur
                    </button>
                    <button class="btn btn-primary" onclick="Attendance.showAddModal()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Tambah Pengurus
                    </button>
                </div>
            </div>

            <div class="filters" style="margin-bottom: 20px;">
                <div class="filter-group">
                    <label>Cari:</label>
                    <input id="structureSearchInput" type="text" class="form-input" placeholder="Role atau nama..." value="${this.filters.search}" oninput="Attendance.handleSearch(this.value)">
                </div>
            </div>

            <div class="card">
                <div class="table-container">
                    <table class="table structure-table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Nama</th>
                                <th>Periode Jabatan</th>
                                <th>Kontak</th>
                                <th>Catatan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length ? filtered.map(entry => `
                                <tr>
                                    <td>${entry.role}</td>
                                    <td>${entry.name}</td>
                                    <td>${entry.periodeJabatan || '-'}</td>
                                    <td>
                                        <div>${entry.phone || '-'}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.86rem;">${entry.email || ''}</div>
                                    </td>
                                    <td>${entry.notes || '-'}</td>
                                    <td>
                                        <div class="table-actions">
                                            <button class="action-btn view" onclick="Attendance.showDetailModal('${entry.id}')" title="Detail">
                                                <svg viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                                            </button>
                                            <button class="action-btn edit" onclick="Attendance.showEditModal('${entry.id}')" title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
                                            </button>
                                            ${canDelete ? `
                                                <button class="action-btn delete" onclick="Attendance.deleteEntry('${entry.id}')" title="Hapus">
                                                    <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="6">
                                        ${Components.emptyState(
                                            '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3L3 8V16L12 21L21 16V8L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 21V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 8L12 12L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
                                            'Belum Ada Pengurus',
                                            'Tambah pengurus baru untuk mengisi struktur gereja.',
                                            'Tambah Pengurus',
                                            'Attendance.showAddModal()'
                                        )}
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    getFiltered() {
        if (!this.filters.search) return this.structure;
        const q = this.filters.search.toLowerCase();
        return this.structure.filter(item =>
            item.role.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
            (item.periodeJabatan || '').toLowerCase().includes(q) ||
            (item.email || '').toLowerCase().includes(q) ||
            (item.phone || '').includes(q)
        );
    },

    handleSearch(value) {
        this.filters.search = value;
        
        // Debounce render to prevent cursor jumping
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        this.searchDebounceTimer = setTimeout(() => {
            // Save cursor position right BEFORE render
            const input = document.getElementById('structureSearchInput');
            const savedValue = input ? input.value : value;
            const savedPos = input ? input.selectionStart : value.length;
            
            this.render();
            
            // Use requestAnimationFrame to focus after DOM is fully updated
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const newInput = document.getElementById('structureSearchInput');
                    if (newInput) {
                        newInput.value = savedValue;
                        newInput.focus();
                        newInput.setSelectionRange(savedValue.length, savedValue.length);
                    }
                });
            });
        }, 300);
    },

    showAddModal() {
        const bodyHtml = `
            <form id="structureForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Role/Jabatan</label>
                        <input type="text" class="form-input" name="role" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Nama</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Periode Jabatan</label>
                    <input type="text" class="form-input" name="periodeJabatan" placeholder="Contoh: 2025-2029">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Telepon</label>
                        <input type="tel" class="form-input" name="phone">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-textarea" name="notes" rows="2" placeholder="Opsional..."></textarea>
                </div>
            </form>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Attendance.saveEntry()">Simpan</button>
        `;

        Components.modal('Tambah Pengurus', bodyHtml, footerHtml);
    },

    saveEntry() {
        const form = document.getElementById('structureForm');
        const data = Object.fromEntries(new FormData(form).entries());

        if (!data.role || !data.name) {
            Components.toast('Role dan nama wajib diisi', 'error');
            return;
        }

        AppData.addStructure(data);
        Components.toast('Pengurus berhasil ditambahkan', 'success');
        Components.closeModal();
        this.render();
    },

    showEditModal(id) {
        const entry = this.structure.find(s => s.id === id);
        if (!entry) return;

        const bodyHtml = `
            <form id="structureEditForm">
                <input type="hidden" name="id" value="${entry.id}">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Role/Jabatan</label>
                        <input type="text" class="form-input" name="role" value="${entry.role}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Nama</label>
                        <input type="text" class="form-input" name="name" value="${entry.name}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Periode Jabatan</label>
                    <input type="text" class="form-input" name="periodeJabatan" value="${entry.periodeJabatan || ''}" placeholder="Contoh: 2025-2029">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Telepon</label>
                        <input type="tel" class="form-input" name="phone" value="${entry.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" value="${entry.email || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-textarea" name="notes" rows="2">${entry.notes || ''}</textarea>
                </div>
            </form>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Attendance.saveEditedEntry()">Simpan Perubahan</button>
        `;

        Components.modal('Edit Pengurus', bodyHtml, footerHtml);
    },

    saveEditedEntry() {
        const form = document.getElementById('structureEditForm');
        const data = Object.fromEntries(new FormData(form).entries());

        if (!data.id || !data.role || !data.name) {
            Components.toast('Role dan nama wajib diisi', 'error');
            return;
        }

        AppData.updateStructure(data.id, {
            role: data.role,
            name: data.name,
            periodeJabatan: data.periodeJabatan,
            phone: data.phone,
            email: data.email,
            notes: data.notes
        });

        Components.toast('Pengurus berhasil diperbarui', 'success');
        Components.closeModal();
        this.render();
    },

    deleteEntry(id) {
        if (!Auth.canDeleteSync()) {
            Components.toast('Hanya admin yang dapat menghapus data.', 'warning');
            return;
        }
        const entry = this.structure.find(s => s.id === id);
        if (!entry) return;

        Components.confirm(
            'Hapus Pengurus',
            `Yakin ingin menghapus ${entry.name}?`,
            () => {
                AppData.deleteStructure(id);
                Components.toast('Pengurus berhasil dihapus', 'success');
                this.render();
            }
        );
    },

    showDetailModal(id) {
        const entry = this.structure.find(s => s.id === id);
        if (!entry) return;

        const bodyHtml = `
            <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Role</span>
                    <span>${entry.role}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Nama</span>
                    <span>${entry.name}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Periode Jabatan</span>
                    <span>${entry.periodeJabatan || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Telepon</span>
                    <span>${entry.phone || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Email</span>
                    <span>${entry.email || '-'}</span>
                </div>
                <div style="padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary); display: block; margin-bottom: 4px;">Catatan</span>
                    <span>${entry.notes || '-'}</span>
                </div>
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
            <button class="btn btn-primary" onclick="Components.closeModal(); Attendance.showEditModal('${entry.id}')">Edit</button>
        `;

        Components.modal('Detail Pengurus', bodyHtml, footerHtml);
    },

    printStructure() {
        const rows = this.structure.map((item, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${item.role}</td>
                <td>${item.name}</td>
                <td>${item.periodeJabatan || ''}</td>
                <td>${item.phone || ''}</td>
                <td>${item.email || ''}</td>
                <td>${item.notes || ''}</td>
            </tr>
        `).join('');

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            Components.toast('Pop-up diblokir browser. Izinkan pop-up untuk mencetak.', 'warning');
            return;
        }

        printWindow.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Cetak Struktur Pengurus</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
                    h1 { font-size: 20px; margin-bottom: 6px; }
                    p { color: #6b7280; margin-top: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
                    th { background: #f3f4f6; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Struktur Pengurus Gereja</h1>
                <p>Tanggal cetak: ${new Date().toLocaleDateString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Role</th>
                            <th>Nama</th>
                            <th>Periode Jabatan</th>
                            <th>Telepon</th>
                            <th>Email</th>
                            <th>Catatan</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
};
