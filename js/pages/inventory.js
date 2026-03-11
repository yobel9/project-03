// ============================================
// Church Admin - Inventory Page
// ============================================

const Inventory = {
    items: [],
    filteredItems: [],
    maxImageSizeMB: 4,
    maxImageDimension: 960,
    filters: {
        search: '',
        category: '',
        condition: ''
    },

    categoryLabels: {
        electronic: 'Elektronik',
        furniture: 'Furniture',
        music: 'Alat Musik',
        worship: 'Perlengkapan Ibadah',
        other: 'Lainnya'
    },

    conditionLabels: {
        good: 'Baik',
        minor_damage: 'Rusak Ringan',
        damaged: 'Rusak'
    },

    conditionClasses: {
        good: 'badge-success',
        minor_damage: 'badge-warning',
        damaged: 'badge-danger'
    },

    async render() {
        this.items = AppData.getInventoryItems();
        this.applyFilters();

        const isMobile = window.innerWidth <= 900;
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Inventaris Gereja</h1>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn btn-secondary" onclick="Inventory.exportExcel()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V3M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Export Excel
                    </button>
                    <button class="btn btn-secondary" onclick="Inventory.printInventory()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2"/><path d="M6 18H5A2 2 0 0 1 3 16V11A2 2 0 0 1 5 9H19A2 2 0 0 1 21 11V16A2 2 0 0 1 19 18H18" stroke="currentColor" stroke-width="2"/><rect x="6" y="14" width="12" height="8" stroke="currentColor" stroke-width="2"/></svg>
                        Print
                    </button>
                    <button class="btn btn-primary" onclick="Inventory.showAddModal()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Tambah Barang
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="filters">
                    <div class="filter-group">
                        <label>Cari:</label>
                        <input id="inventorySearchInput" type="text" class="form-input" placeholder="Nama barang atau lokasi..." value="${this.filters.search}" oninput="Inventory.handleSearch(this.value)">
                    </div>
                    <div class="filter-group">
                        <label>Kategori:</label>
                        <select class="form-select" onchange="Inventory.handleCategoryFilter(this.value)">
                            <option value="">Semua</option>
                            <option value="electronic" ${this.filters.category === 'electronic' ? 'selected' : ''}>Elektronik</option>
                            <option value="furniture" ${this.filters.category === 'furniture' ? 'selected' : ''}>Furniture</option>
                            <option value="music" ${this.filters.category === 'music' ? 'selected' : ''}>Alat Musik</option>
                            <option value="worship" ${this.filters.category === 'worship' ? 'selected' : ''}>Perlengkapan Ibadah</option>
                            <option value="other" ${this.filters.category === 'other' ? 'selected' : ''}>Lainnya</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Kondisi:</label>
                        <select class="form-select" onchange="Inventory.handleConditionFilter(this.value)">
                            <option value="">Semua</option>
                            <option value="good" ${this.filters.condition === 'good' ? 'selected' : ''}>Baik</option>
                            <option value="minor_damage" ${this.filters.condition === 'minor_damage' ? 'selected' : ''}>Rusak Ringan</option>
                            <option value="damaged" ${this.filters.condition === 'damaged' ? 'selected' : ''}>Rusak</option>
                        </select>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table events-table">
                        ${!isMobile ? `
                            <thead>
                                <tr>
                                    <th>Nama Barang</th>
                                    <th>Kategori</th>
                                    <th>Jumlah</th>
                                    <th>Kondisi</th>
                                    <th>Lokasi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                        ` : ''}
                        <tbody>
                            ${this.renderRows(isMobile)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    applyFilters() {
        const q = this.filters.search.toLowerCase();
        this.filteredItems = this.items.filter((item) => {
            const matchSearch = !q
                || (item.name || '').toLowerCase().includes(q)
                || (item.location || '').toLowerCase().includes(q)
                || (item.notes || '').toLowerCase().includes(q);
            const matchCategory = !this.filters.category || item.category === this.filters.category;
            const matchCondition = !this.filters.condition || item.condition === this.filters.condition;
            return matchSearch && matchCategory && matchCondition;
        });
    },

    renderRows(isMobile) {
        const canDelete = Auth.canDeleteSync();
        if (!this.filteredItems.length) {
            return `
                <tr>
                    <td colspan="6">
                        ${Components.emptyState(
                            '<svg viewBox="0 0 24 24" fill="none"><path d="M3 7L12 2L21 7V17L12 22L3 17V7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3 7L12 12L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
                            'Belum Ada Data Inventaris',
                            'Tambahkan data inventaris gereja untuk memudahkan pendataan aset.',
                            'Tambah Barang',
                            'Inventory.showAddModal()'
                        )}
                    </td>
                </tr>
            `;
        }

        if (isMobile) {
            return this.filteredItems.map((item) => `
                <tr>
                    <td colspan="6" style="padding: 0;">
                        <div style="padding: 16px; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                                    ${this.getPhotoPreviewHtml(item.photo, item.name, 42)}
                                    <div style="font-weight: 600; overflow-wrap: anywhere;">${item.name}</div>
                                </div>
                                <span class="badge ${this.conditionClasses[item.condition] || 'badge-info'}">${this.conditionLabels[item.condition] || '-'}</span>
                            </div>
                            <div style="font-size: 0.857rem; color: var(--text-secondary); margin-bottom: 8px;">
                                <div>📦 ${this.categoryLabels[item.category] || '-'}</div>
                                <div>🔢 ${item.quantity || 0} ${item.unit || 'unit'}</div>
                                <div>📍 ${item.location || '-'}</div>
                            </div>
                            <div style="display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
                                <button class="btn btn-sm btn-secondary" onclick="Inventory.showDetailModal('${item.id}')">Lihat</button>
                                <button class="btn btn-sm btn-primary" onclick="Inventory.showEditModal('${item.id}')">Edit</button>
                                ${canDelete ? `<button class="btn btn-sm btn-danger" onclick="Inventory.deleteItem('${item.id}')">Hapus</button>` : ''}
                            </div>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        return this.filteredItems.map((item) => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${this.getPhotoPreviewHtml(item.photo, item.name, 36)}
                        <strong>${item.name}</strong>
                    </div>
                </td>
                <td>${this.categoryLabels[item.category] || '-'}</td>
                <td>${item.quantity || 0} ${item.unit || 'unit'}</td>
                <td><span class="badge ${this.conditionClasses[item.condition] || 'badge-info'}">${this.conditionLabels[item.condition] || '-'}</span></td>
                <td>${item.location || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="Inventory.showDetailModal('${item.id}')" title="Detail">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        <button class="action-btn edit" onclick="Inventory.showEditModal('${item.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        ${canDelete ? `
                            <button class="action-btn delete" onclick="Inventory.deleteItem('${item.id}')" title="Hapus">
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
            // Save cursor position right BEFORE render
            const input = document.getElementById('inventorySearchInput');
            const savedValue = input ? input.value : value;
            const savedPos = input ? input.selectionStart : value.length;
            
            this.render();
            
            // Restore input value and cursor position AFTER render
            const newInput = document.getElementById('inventorySearchInput');
            if (newInput) {
                newInput.value = savedValue;
                if (savedPos >= 0 && savedPos <= savedValue.length) {
                    newInput.setSelectionRange(savedPos, savedPos);
                }
            }
        }, 500);
    },

    handleCategoryFilter(value) {
        this.filters.category = value;
        this.applyFilters();
        this.render();
    },

    handleConditionFilter(value) {
        this.filters.condition = value;
        this.applyFilters();
        this.render();
    },

    getPhotoPreviewHtml(photo, name, size = 48) {
        if (photo) {
            return `<img src="${photo}" alt="${name || 'Foto barang'}" style="width:${size}px;height:${size}px;border-radius:8px;object-fit:cover;border:1px solid var(--border);">`;
        }
        return `<div style="width:${size}px;height:${size}px;border-radius:8px;background:var(--background);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.75rem;">No Img</div>`;
    },

    getFormHtml(item = {}) {
        return `
            <form id="inventoryForm">
                <input type="hidden" name="id" value="${item.id || ''}">
                <input type="hidden" name="photo" id="inventoryPhotoData" value="${item.photo || ''}">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nama Barang</label>
                        <input type="text" class="form-input" name="name" value="${item.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Kategori</label>
                        <select class="form-select" name="category" required>
                            <option value="">Pilih...</option>
                            <option value="electronic" ${item.category === 'electronic' ? 'selected' : ''}>Elektronik</option>
                            <option value="furniture" ${item.category === 'furniture' ? 'selected' : ''}>Furniture</option>
                            <option value="music" ${item.category === 'music' ? 'selected' : ''}>Alat Musik</option>
                            <option value="worship" ${item.category === 'worship' ? 'selected' : ''}>Perlengkapan Ibadah</option>
                            <option value="other" ${item.category === 'other' ? 'selected' : ''}>Lainnya</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Jumlah</label>
                        <input type="number" class="form-input" name="quantity" min="0" value="${item.quantity ?? 1}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Satuan</label>
                        <input type="text" class="form-input" name="unit" value="${item.unit || 'unit'}" placeholder="Contoh: unit, buah, set">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Kondisi</label>
                        <select class="form-select" name="condition" required>
                            <option value="good" ${!item.condition || item.condition === 'good' ? 'selected' : ''}>Baik</option>
                            <option value="minor_damage" ${item.condition === 'minor_damage' ? 'selected' : ''}>Rusak Ringan</option>
                            <option value="damaged" ${item.condition === 'damaged' ? 'selected' : ''}>Rusak</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Lokasi</label>
                        <input type="text" class="form-input" name="location" value="${item.location || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tanggal Perolehan</label>
                        <input type="date" class="form-input" name="acquiredDate" value="${item.acquiredDate || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nilai (Rp)</label>
                        <input type="number" class="form-input" name="value" min="0" value="${item.value || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-textarea" name="notes" rows="3">${item.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Foto Barang</label>
                    <input type="file" class="form-input" accept="image/*" onchange="Inventory.handlePhotoUpload(event)">
                    <small style="display:block;color:var(--text-secondary);margin-top:6px;">Maksimal ${this.maxImageSizeMB}MB. Foto akan dikompres otomatis.</small>
                    <div style="margin-top:10px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <div id="inventoryPhotoPreviewWrap">
                            ${this.getPhotoPreviewHtml(item.photo, item.name || 'Foto barang', 78)}
                        </div>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="Inventory.clearPhoto()">Hapus Foto</button>
                    </div>
                </div>
            </form>
        `;
    },

    async handlePhotoUpload(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Components.toast('File harus berupa gambar.', 'error');
            event.target.value = '';
            return;
        }

        if (file.size > this.maxImageSizeMB * 1024 * 1024) {
            Components.toast(`Ukuran foto maksimal ${this.maxImageSizeMB}MB.`, 'error');
            event.target.value = '';
            return;
        }

        try {
            const dataUrl = await this.compressImage(file);
            const photoInput = document.getElementById('inventoryPhotoData');
            const previewWrap = document.getElementById('inventoryPhotoPreviewWrap');
            if (photoInput) photoInput.value = dataUrl;
            if (previewWrap) previewWrap.innerHTML = this.getPhotoPreviewHtml(dataUrl, 'Foto barang', 78);
        } catch (error) {
            Components.toast('Gagal memproses foto.', 'error');
        }
    },

    clearPhoto() {
        const photoInput = document.getElementById('inventoryPhotoData');
        const previewWrap = document.getElementById('inventoryPhotoPreviewWrap');
        if (photoInput) photoInput.value = '';
        if (previewWrap) previewWrap.innerHTML = this.getPhotoPreviewHtml('', 'Foto barang', 78);
    },

    compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    const maxDim = this.maxImageDimension;
                    if (width > maxDim || height > maxDim) {
                        const scale = Math.min(maxDim / width, maxDim / height);
                        width = Math.round(width * scale);
                        height = Math.round(height * scale);
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas not available'));
                        return;
                    }
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.onerror = () => reject(new Error('Invalid image'));
                img.src = reader.result;
            };
            reader.onerror = () => reject(new Error('Read failed'));
            reader.readAsDataURL(file);
        });
    },

    showAddModal() {
        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Inventory.saveItem()">Simpan</button>
        `;
        Components.modal('Tambah Inventaris', this.getFormHtml(), footerHtml);
    },

    showEditModal(id) {
        const item = this.items.find((entry) => entry.id === id);
        if (!item) return;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Inventory.saveItem()">Simpan Perubahan</button>
        `;
        Components.modal('Edit Inventaris', this.getFormHtml(item), footerHtml);
    },

    saveItem() {
        const form = document.getElementById('inventoryForm');
        const formData = Object.fromEntries(new FormData(form).entries());

        if (!formData.name || !formData.category || !formData.location || !formData.condition) {
            Components.toast('Field wajib belum lengkap.', 'error');
            return;
        }

        if (formData.quantity === '' || Number(formData.quantity) < 0) {
            Components.toast('Jumlah barang tidak valid.', 'error');
            return;
        }

        const payload = {
            name: formData.name.trim(),
            category: formData.category,
            quantity: parseInt(formData.quantity, 10) || 0,
            unit: (formData.unit || 'unit').trim() || 'unit',
            condition: formData.condition,
            location: formData.location.trim(),
            acquiredDate: formData.acquiredDate || '',
            value: formData.value ? parseInt(formData.value, 10) : 0,
            photo: formData.photo || '',
            notes: (formData.notes || '').trim()
        };

        if (formData.id) {
            AppData.updateInventoryItem(formData.id, payload);
            Components.toast('Data inventaris berhasil diperbarui', 'success');
        } else {
            AppData.addInventoryItem(payload);
            Components.toast('Data inventaris berhasil ditambahkan', 'success');
        }

        Components.closeModal();
        this.render();
    },

    showDetailModal(id) {
        const item = this.items.find((entry) => entry.id === id);
        if (!item) return;

        const valueText = item.value ? `Rp ${new Intl.NumberFormat('id-ID').format(item.value)}` : '-';
        const bodyHtml = `
            <div style="display: grid; gap: 10px;">
                <div><strong>Foto Barang:</strong><br><div style="margin-top:8px;">${this.getPhotoPreviewHtml(item.photo, item.name || 'Foto barang', 120)}</div></div>
                <div><strong>Nama Barang:</strong><br>${item.name || '-'}</div>
                <div><strong>Kategori:</strong><br>${this.categoryLabels[item.category] || '-'}</div>
                <div><strong>Jumlah:</strong><br>${item.quantity || 0} ${item.unit || 'unit'}</div>
                <div><strong>Kondisi:</strong><br>${this.conditionLabels[item.condition] || '-'}</div>
                <div><strong>Lokasi:</strong><br>${item.location || '-'}</div>
                <div><strong>Tanggal Perolehan:</strong><br>${item.acquiredDate ? Components.formatDate(item.acquiredDate) : '-'}</div>
                <div><strong>Nilai:</strong><br>${valueText}</div>
                <div><strong>Catatan:</strong><br>${item.notes || '-'}</div>
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
            <button class="btn btn-primary" onclick="Components.closeModal(); Inventory.showEditModal('${item.id}')">Edit</button>
        `;
        Components.modal('Detail Inventaris', bodyHtml, footerHtml);
    },

    deleteItem(id) {
        if (!Auth.canDeleteSync()) {
            Components.toast('Hanya admin yang dapat menghapus data.', 'warning');
            return;
        }
        const item = this.items.find((entry) => entry.id === id);
        if (!item) return;

        Components.confirm(
            'Hapus Inventaris',
            `Apakah Anda yakin ingin menghapus ${item.name}?`,
            () => {
                AppData.deleteInventoryItem(id);
                Components.toast('Inventaris berhasil dihapus', 'success');
                this.render();
            }
        );
    },

    exportExcel() {
        if (!this.filteredItems.length) {
            Components.toast('Tidak ada data inventaris untuk diexport.', 'warning');
            return;
        }
        if (typeof XLSX === 'undefined') {
            Components.toast('Library Excel belum tersedia. Refresh halaman lalu coba lagi.', 'error');
            return;
        }

        const rows = this.filteredItems.map((item, index) => ({
            No: index + 1,
            'Nama Barang': item.name || '',
            Kategori: this.categoryLabels[item.category] || '-',
            Jumlah: item.quantity || 0,
            Satuan: item.unit || 'unit',
            Kondisi: this.conditionLabels[item.condition] || '-',
            Lokasi: item.location || '-',
            'Tanggal Perolehan': item.acquiredDate || '',
            'Nilai (Rp)': item.value || 0,
            'Ada Foto': item.photo ? 'Ya' : 'Tidak',
            Catatan: item.notes || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaris');
        XLSX.writeFile(workbook, `inventaris-gereja-${new Date().toISOString().slice(0, 10)}.xlsx`);
        Components.toast('Data inventaris berhasil diexport.', 'success');
    },

    printInventory() {
        if (!this.filteredItems.length) {
            Components.toast('Tidak ada data inventaris untuk dicetak.', 'warning');
            return;
        }

        const rows = this.filteredItems.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name || '-'}</td>
                <td>${this.categoryLabels[item.category] || '-'}</td>
                <td>${item.quantity || 0} ${item.unit || 'unit'}</td>
                <td>${this.conditionLabels[item.condition] || '-'}</td>
                <td>${item.location || '-'}</td>
                <td>${item.acquiredDate ? Components.formatDate(item.acquiredDate) : '-'}</td>
                <td>${item.value ? `Rp ${new Intl.NumberFormat('id-ID').format(item.value)}` : '-'}</td>
                <td>${item.photo ? 'Ya' : 'Tidak'}</td>
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
                <title>Laporan Inventaris Gereja</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
                    h1 { margin: 0 0 6px; font-size: 20px; }
                    p { margin: 0 0 14px; color: #555; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; vertical-align: top; }
                    th { background: #f3f4f6; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Laporan Inventaris Gereja</h1>
                <p>Tanggal cetak: ${new Date().toLocaleDateString('id-ID')} | Total barang: ${this.filteredItems.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Barang</th>
                            <th>Kategori</th>
                            <th>Jumlah</th>
                            <th>Kondisi</th>
                            <th>Lokasi</th>
                            <th>Tanggal Perolehan</th>
                            <th>Nilai</th>
                            <th>Foto</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 200);
    }
};
