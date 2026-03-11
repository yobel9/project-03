// ============================================
// Church Admin - Members Page
// ============================================

const Members = {
    members: [],
    filteredMembers: [],
    currentPage: 1,
    itemsPerPage: 10,
    baptismStatusOptions: {
        baptized: 'Sudah Baptis',
        not_baptized: 'Belum Baptis'
    },
    commissionOptions: {
        sunday_school: 'Komisi Sekolah Minggu',
        youth: 'Komisi Pemuda Remaja',
        men: 'Komisi Pria',
        women: 'Komisi Wanita'
    },
    filters: {
        search: '',
        status: '',
        gender: ''
    },

    async render() {
        this.members = AppData.getMembers();
        this.applyFilters();
        
        const isMobile = window.innerWidth <= 900;
        const currentUser = await Auth.getCurrentUser();
        
        const content = document.getElementById('content');
        
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Data Jemaat</h1>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="Members.triggerImport()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 3V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Import Excel
                    </button>
                    <button class="btn btn-secondary" onclick="Members.exportExcel()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V3M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Export Excel
                    </button>
                    <button class="btn btn-secondary" onclick="Members.printAllMembers()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2"/><path d="M6 18H5A2 2 0 0 1 3 16V11A2 2 0 0 1 5 9H19A2 2 0 0 1 21 11V16A2 2 0 0 1 19 18H18" stroke="currentColor" stroke-width="2"/><rect x="6" y="14" width="12" height="8" stroke="currentColor" stroke-width="2"/></svg>
                        Print Semua
                    </button>
                    <button class="btn btn-primary" onclick="Members.showAddModal()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Tambah Jemaat
                    </button>
                </div>
            </div>
            <input type="file" id="memberImportInput" accept=".xlsx,.xls,.csv" style="display:none" onchange="Members.handleImportFile(event)">

            <div class="card">
                <div class="filters">
                    <div class="filter-group">
                        <label>Pencarian:</label>
                        <input id="membersSearchInput" type="text" class="form-input" placeholder="Nama, NIK, email, atau telepon..." 
                               value="${this.filters.search}" oninput="Members.handleSearch(this.value)">
                    </div>
                    <div class="filter-group">
                        <label>Status:</label>
                        <select class="form-select" onchange="Members.handleStatusFilter(this.value)">
                            <option value="">Semua</option>
                            <option value="active" ${this.filters.status === 'active' ? 'selected' : ''}>Aktif</option>
                            <option value="inactive" ${this.filters.status === 'inactive' ? 'selected' : ''}>Tidak Aktif</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Jenis Kelamin:</label>
                        <select class="form-select" onchange="Members.handleGenderFilter(this.value)">
                            <option value="">Semua</option>
                            <option value="Male" ${this.filters.gender === 'Male' ? 'selected' : ''}>Laki-laki</option>
                            <option value="Female" ${this.filters.gender === 'Female' ? 'selected' : ''}>Perempuan</option>
                        </select>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table members-table">
                        ${!isMobile ? `<thead>
                            <tr>
                                <th>Nama</th>
                                <th>Jenis Kelamin</th>
                                <th>Umur</th>
                                <th>Komisi</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>` : ''}
                        <tbody>
                            ${this.renderTableRows()}
                        </tbody>
                    </table>
                </div>

                ${this.renderPagination()}
            </div>
        `;
    },

    renderTableRows() {
        if (this.filteredMembers.length === 0) {
            return `
                <tr>
                    <td colspan="6">
                        ${Components.emptyState(
                            '<svg viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>',
                            'Tidak Ada Data',
                            'Belum ada data jemaat. Tambahkan jemaat pertama Anda.',
                            'Tambah Jemaat',
                            'Members.showAddModal()'
                        )}
                    </td>
                </tr>
            `;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const pageMembers = this.filteredMembers.slice(startIndex, startIndex + this.itemsPerPage);

        // Check if mobile
        const isMobile = window.innerWidth <= 900;
        const canDelete = Auth.canDeleteSync();
        
        if (isMobile) {
            // Card view for mobile
            return pageMembers.map((member, index) => `
                <tr>
                    <td colspan="6" style="padding: 0;">
                        <div style="padding: 16px; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div class="member-avatar">${Components.getInitials(member.name)}</div>
                                <div>
                                    <div style="font-weight: 600;">${member.name}</div>
                                    <span class="badge ${member.status === 'active' ? 'badge-success' : 'badge-danger'}">${member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</span>
                                </div>
                            </div>
                            <div style="font-size: 0.857rem; color: var(--text-secondary); margin-bottom: 8px;">
                                <div>🪪 ${member.nik || '-'}</div>
                                <div>🚻 ${member.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}</div>
                                <div>📱 ${member.phone}</div>
                                <div>✉️ ${member.email || '-'}</div>
                                <div>🎂 ${member.birthDate ? Components.formatDate(member.birthDate) : '-'}</div>
                                <div>📊 ${this.getAge(member.birthDate)}</div>
                                <div>💧 ${this.getBaptismStatusLabel(member.baptismStatus)}</div>
                                <div>👥 ${this.getCommissionLabel(member.commission)}</div>
                                ${member.address ? `<div>🏠 ${member.address}, ${member.city || ''}</div>` : ''}
                            </div>
                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                <button class="btn btn-sm btn-secondary" onclick="Members.viewMember('${member.id}')">Lihat</button>
                                <button class="btn btn-sm btn-primary" onclick="Members.editMember('${member.id}')">Edit</button>
                                ${canDelete ? `<button class="btn btn-sm btn-danger" onclick="Members.deleteMember('${member.id}')">Hapus</button>` : ''}
                            </div>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Table view for desktop
        return pageMembers.map((member, index) => `
            <tr>
                <td>
                    <div class="member-cell">
                        <div class="member-avatar">${Components.getInitials(member.name)}</div>
                        <span>${member.name}</span>
                    </div>
                </td>
                <td>${member.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}</td>
                <td>${this.getAge(member.birthDate)}</td>
                <td>${this.getCommissionLabel(member.commission)}</td>
                <td>
                    <span class="badge ${member.status === 'active' ? 'badge-success' : 'badge-danger'}">
                        ${member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="Members.viewMember('${member.id}')" title="Lihat">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        <button class="action-btn edit" onclick="Members.editMember('${member.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        ${canDelete ? `
                            <button class="action-btn delete" onclick="Members.deleteMember('${member.id}')" title="Hapus">
                                <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getAge(birthDate) {
        if (!birthDate) return '-';

        const today = new Date();
        const dob = new Date(birthDate);
        if (Number.isNaN(dob.getTime())) return '-';

        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const hasHadBirthday = monthDiff > 0 || (monthDiff === 0 && today.getDate() >= dob.getDate());

        if (!hasHadBirthday) {
            age -= 1;
        }

        return age >= 0 ? `${age} th` : '-';
    },

    getBaptismStatusLabel(status) {
        return this.baptismStatusOptions[status] || '-';
    },

    getCommissionLabel(commission) {
        return this.commissionOptions[commission] || '-';
    },

    renderPagination() {
        const totalPages = Math.ceil(this.filteredMembers.length / this.itemsPerPage);
        return Components.pagination(this.currentPage, totalPages, 'Members.changePage');
    },

    changePage(page) {
        this.currentPage = page;
        this.render();
        // Scroll to top of table
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    },

    applyFilters() {
        this.filteredMembers = this.members.filter(member => {
            const matchSearch = !this.filters.search || 
                member.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                member.nik?.includes(this.filters.search) ||
                member.email?.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                member.phone.includes(this.filters.search);
            
            const matchStatus = !this.filters.status || member.status === this.filters.status;
            const matchGender = !this.filters.gender || member.gender === this.filters.gender;
            
            return matchSearch && matchStatus && matchGender;
        });

        // Reset to page 1 when filters change
        this.currentPage = 1;
    },

    handleSearch(value) {
        this.filters.search = value;
        this.applyFilters();
        
        // Debounce render to prevent cursor jumping - longer delay for smoother typing
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        this.searchDebounceTimer = setTimeout(() => {
            // Save cursor position right BEFORE render (after debounce completes)
            const input = document.getElementById('membersSearchInput');
            const savedValue = input ? input.value : value;
            const savedPos = input ? input.selectionStart : value.length;
            
            this.render();
            
            // Restore input value and cursor position AFTER render
            const newInput = document.getElementById('membersSearchInput');
            if (newInput) {
                newInput.value = savedValue;
                // Only restore cursor if it's within valid range
                if (savedPos >= 0 && savedPos <= savedValue.length) {
                    newInput.setSelectionRange(savedPos, savedPos);
                }
            }
        }, 500);
    },

    handleStatusFilter(value) {
        this.filters.status = value;
        this.applyFilters();
        this.render();
    },

    handleGenderFilter(value) {
        this.filters.gender = value;
        this.applyFilters();
        this.render();
    },

    showAddModal() {
        const bodyHtml = `
            <form id="memberForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nama Lengkap</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Jenis Kelamin</label>
                        <select class="form-select" name="gender" required>
                            <option value="">Pilih...</option>
                            <option value="Male">Laki-laki</option>
                            <option value="Female">Perempuan</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tanggal Lahir</label>
                        <input type="date" class="form-input" name="birthDate">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tempat Lahir</label>
                        <input type="text" class="form-input" name="birthPlace">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">NIK</label>
                        <input type="text" class="form-input" name="nik" maxlength="16" inputmode="numeric" placeholder="16 digit NIK" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Status Baptis</label>
                        <select class="form-select" name="baptismStatus" required>
                            <option value="">Pilih...</option>
                            <option value="baptized">Sudah Baptis</option>
                            <option value="not_baptized">Belum Baptis</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Komisi</label>
                        <select class="form-select" name="commission" required>
                            <option value="">Pilih...</option>
                            <option value="sunday_school">Komisi Sekolah Minggu</option>
                            <option value="youth">Komisi Pemuda Remaja</option>
                            <option value="men">Komisi Pria</option>
                            <option value="women">Komisi Wanita</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Telepon</label>
                        <input type="tel" class="form-input" name="phone" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" name="email">
                </div>
                <div class="form-group">
                    <label class="form-label">Alamat</label>
                    <input type="text" class="form-input" name="address">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Kota</label>
                        <input type="text" class="form-input" name="city">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kode Pos</label>
                        <input type="text" class="form-input" name="postalCode">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tanggal Bergabung</label>
                        <input type="date" class="form-input" name="joinDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-select" name="status">
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-textarea" name="notes" rows="3"></textarea>
                </div>
            </form>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Members.saveMember()">Simpan</button>
        `;

        Components.modal('Tambah Jemaat', bodyHtml, footerHtml);
    },

    editMember(id) {
        const member = this.members.find(m => m.id === id);
        if (!member) return;

        const bodyHtml = `
            <form id="memberForm">
                <input type="hidden" name="id" value="${member.id}">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nama Lengkap</label>
                        <input type="text" class="form-input" name="name" value="${member.name}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Jenis Kelamin</label>
                        <select class="form-select" name="gender" required>
                            <option value="Male" ${member.gender === 'Male' ? 'selected' : ''}>Laki-laki</option>
                            <option value="Female" ${member.gender === 'Female' ? 'selected' : ''}>Perempuan</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tanggal Lahir</label>
                        <input type="date" class="form-input" name="birthDate" value="${member.birthDate || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tempat Lahir</label>
                        <input type="text" class="form-input" name="birthPlace" value="${member.birthPlace || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">NIK</label>
                        <input type="text" class="form-input" name="nik" maxlength="16" inputmode="numeric" placeholder="16 digit NIK" value="${member.nik || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Status Baptis</label>
                        <select class="form-select" name="baptismStatus" required>
                            <option value="">Pilih...</option>
                            <option value="baptized" ${member.baptismStatus === 'baptized' ? 'selected' : ''}>Sudah Baptis</option>
                            <option value="not_baptized" ${member.baptismStatus === 'not_baptized' ? 'selected' : ''}>Belum Baptis</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Komisi</label>
                        <select class="form-select" name="commission" required>
                            <option value="">Pilih...</option>
                            <option value="sunday_school" ${member.commission === 'sunday_school' ? 'selected' : ''}>Komisi Sekolah Minggu</option>
                            <option value="youth" ${member.commission === 'youth' ? 'selected' : ''}>Komisi Pemuda Remaja</option>
                            <option value="men" ${member.commission === 'men' ? 'selected' : ''}>Komisi Pria</option>
                            <option value="women" ${member.commission === 'women' ? 'selected' : ''}>Komisi Wanita</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Telepon</label>
                        <input type="tel" class="form-input" name="phone" value="${member.phone}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" name="email" value="${member.email || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Alamat</label>
                    <input type="text" class="form-input" name="address" value="${member.address || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Kota</label>
                        <input type="text" class="form-input" name="city" value="${member.city || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kode Pos</label>
                        <input type="text" class="form-input" name="postalCode" value="${member.postalCode || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tanggal Bergabung</label>
                        <input type="date" class="form-input" name="joinDate" value="${member.joinDate || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-select" name="status">
                            <option value="active" ${member.status === 'active' ? 'selected' : ''}>Aktif</option>
                            <option value="inactive" ${member.status === 'inactive' ? 'selected' : ''}>Tidak Aktif</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-textarea" name="notes" rows="3">${member.notes || ''}</textarea>
                </div>
            </form>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Members.saveMember()">Simpan Perubahan</button>
        `;

        Components.modal('Edit Jemaat', bodyHtml, footerHtml);
    },

    viewMember(id) {
        const member = this.members.find(m => m.id === id);
        if (!member) return;

        const bodyHtml = `
            <div style="text-align: center; margin-bottom: 24px;">
                <div class="member-avatar" style="width: 80px; height: 80px; font-size: 2rem; margin: 0 auto 16px;">
                    ${Components.getInitials(member.name)}
                </div>
                <h3 style="margin-bottom: 4px;">${member.name}</h3>
                <span class="badge ${member.status === 'active' ? 'badge-success' : 'badge-danger'}">
                    ${member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
            </div>
            <div style="display: grid; gap: 16px;">
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">NIK</span>
                    <span>${member.nik || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Jenis Kelamin</span>
                    <span>${member.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Tanggal Lahir</span>
                    <span>${member.birthDate ? Components.formatDate(member.birthDate) : '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Tempat Lahir</span>
                    <span>${member.birthPlace || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Status Baptis</span>
                    <span>${this.getBaptismStatusLabel(member.baptismStatus)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Komisi</span>
                    <span>${this.getCommissionLabel(member.commission)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Telepon</span>
                    <span>${member.phone}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Email</span>
                    <span>${member.email || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Alamat</span>
                    <span>${member.address ? `${member.address}, ${member.city || ''} ${member.postalCode || ''}` : '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Tanggal Bergabung</span>
                    <span>${member.joinDate ? Components.formatDate(member.joinDate) : '-'}</span>
                </div>
                ${member.notes ? `
                <div style="padding: 12px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary); display: block; margin-bottom: 4px;">Catatan</span>
                    <span>${member.notes}</span>
                </div>
                ` : ''}
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
            <button class="btn btn-primary" onclick="Components.closeModal(); Members.editMember('${member.id}')">Edit</button>
        `;

        Components.modal('Detail Jemaat', bodyHtml, footerHtml);
    },

    saveMember() {
        const form = document.getElementById('memberForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validation
        if (!data.name || !data.nik || !data.phone || !data.gender || !data.baptismStatus || !data.commission) {
            Components.toast('Mohon lengkapi data yang wajib diisi', 'error');
            return;
        }

        if (!/^\d{16}$/.test(data.nik)) {
            Components.toast('NIK harus 16 digit angka', 'error');
            return;
        }

        const id = data.id;
        
        if (id) {
            // Update existing
            AppData.updateMember(id, data);
            Components.toast('Data jemaat berhasil diperbarui', 'success');
        } else {
            // Add new
            AppData.addMember(data);
            Components.toast('Jemaat baru berhasil ditambahkan', 'success');
        }

        Components.closeModal();
        this.render();
    },

    triggerImport() {
        const input = document.getElementById('memberImportInput');
        if (input) input.click();
    },

    handleImportFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (typeof XLSX === 'undefined') {
            Components.toast('Library Excel belum tersedia. Refresh halaman lalu coba lagi.', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

                if (!rows.length) {
                    Components.toast('File import kosong', 'warning');
                    return;
                }

                const today = new Date().toISOString().split('T')[0];
                const existingNik = new Set(AppData.getMembers().map(m => m.nik).filter(Boolean));
                let imported = 0;
                let skipped = 0;

                rows.forEach((row) => {
                    const member = this.mapImportRow(row, today);
                    if (!member) {
                        skipped += 1;
                        return;
                    }
                    if (existingNik.has(member.nik)) {
                        skipped += 1;
                        return;
                    }
                    existingNik.add(member.nik);
                    AppData.addMember(member);
                    imported += 1;
                });

                this.render();
                Components.toast(`Import selesai: ${imported} berhasil, ${skipped} dilewati`, imported > 0 ? 'success' : 'warning');
            } catch (error) {
                Components.toast(`Gagal import: ${error.message}`, 'error');
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    },

    mapImportRow(row, today) {
        const pick = (...keys) => {
            for (const key of keys) {
                if (row[key] !== undefined && String(row[key]).trim() !== '') {
                    return String(row[key]).trim();
                }
            }
            return '';
        };

        const normalizeGender = (value) => {
            const v = value.toLowerCase();
            if (v.includes('male') || v.includes('laki')) return 'Male';
            if (v.includes('female') || v.includes('perempuan')) return 'Female';
            return '';
        };

        const normalizeBaptism = (value) => {
            const v = value.toLowerCase();
            if (v.includes('sudah') || v.includes('baptized') || v.includes('ya')) return 'baptized';
            if (v.includes('belum') || v.includes('not') || v.includes('tidak')) return 'not_baptized';
            return '';
        };

        const normalizeCommission = (value) => {
            const v = value.toLowerCase();
            if (v.includes('sekolah')) return 'sunday_school';
            if (v.includes('pemuda') || v.includes('remaja') || v.includes('youth')) return 'youth';
            if (v.includes('pria') || v.includes('men')) return 'men';
            if (v.includes('wanita') || v.includes('women')) return 'women';
            return '';
        };

        const normalizeStatus = (value) => {
            const v = value.toLowerCase();
            return (v.includes('tidak') || v.includes('inactive')) ? 'inactive' : 'active';
        };

        const member = {
            name: pick('Nama', 'name'),
            nik: pick('NIK', 'nik').replace(/\D/g, ''),
            gender: normalizeGender(pick('Jenis Kelamin', 'gender')),
            birthDate: pick('Tanggal Lahir', 'birthDate'),
            birthPlace: pick('Tempat Lahir', 'birthPlace'),
            baptismStatus: normalizeBaptism(pick('Status Baptis', 'baptismStatus')),
            commission: normalizeCommission(pick('Komisi', 'commission')),
            phone: pick('Telepon', 'phone'),
            email: pick('Email', 'email'),
            address: pick('Alamat', 'address'),
            city: pick('Kota', 'city'),
            postalCode: pick('Kode Pos', 'postalCode'),
            joinDate: pick('Tanggal Bergabung', 'joinDate') || today,
            status: normalizeStatus(pick('Status', 'status')),
            notes: pick('Catatan', 'notes')
        };

        if (!member.name || !/^\d{16}$/.test(member.nik) || !member.gender || !member.baptismStatus || !member.commission || !member.phone) {
            return null;
        }

        return member;
    },

    exportExcel() {
        const members = AppData.getMembers();
        if (!members.length) {
            Components.toast('Tidak ada data untuk diexport', 'warning');
            return;
        }

        if (typeof XLSX === 'undefined') {
            Components.toast('Library Excel belum tersedia. Refresh halaman lalu coba lagi.', 'error');
            return;
        }

        const rows = members.map((member) => ({
            Nama: member.name || '',
            NIK: member.nik || '',
            'Jenis Kelamin': member.gender === 'Male' ? 'Laki-laki' : member.gender === 'Female' ? 'Perempuan' : '',
            Umur: this.getAge(member.birthDate),
            'Status Baptis': this.getBaptismStatusLabel(member.baptismStatus),
            Komisi: this.getCommissionLabel(member.commission),
            Telepon: member.phone || '',
            Email: member.email || '',
            Alamat: member.address || '',
            Kota: member.city || '',
            'Kode Pos': member.postalCode || '',
            'Tanggal Lahir': member.birthDate || '',
            'Tempat Lahir': member.birthPlace || '',
            'Tanggal Bergabung': member.joinDate || '',
            Status: member.status === 'active' ? 'Aktif' : 'Tidak Aktif',
            Catatan: member.notes || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Jemaat');
        XLSX.writeFile(workbook, 'data-jemaat.xlsx');
        Components.toast('Data jemaat berhasil diexport', 'success');
    },

    printAllMembers() {
        const members = AppData.getMembers();
        if (!members.length) {
            Components.toast('Tidak ada data untuk dicetak', 'warning');
            return;
        }

        const rows = members.map((member, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${member.name || '-'}</td>
                <td>${member.nik || '-'}</td>
                <td>${member.gender === 'Male' ? 'Laki-laki' : member.gender === 'Female' ? 'Perempuan' : '-'}</td>
                <td>${member.birthDate ? Components.formatDate(member.birthDate) : '-'}</td>
                <td>${member.birthPlace || '-'}</td>
                <td>${this.getAge(member.birthDate)}</td>
                <td>${this.getBaptismStatusLabel(member.baptismStatus)}</td>
                <td>${this.getCommissionLabel(member.commission)}</td>
                <td>${member.phone || '-'}</td>
                <td>${member.email || '-'}</td>
                <td>${member.address ? `${member.address}, ${member.city || ''} ${member.postalCode || ''}`.trim() : '-'}</td>
                <td>${member.joinDate ? Components.formatDate(member.joinDate) : '-'}</td>
                <td>${member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</td>
                <td>${member.notes || '-'}</td>
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
                <title>Print Data Jemaat</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; }
                    h1 { font-size: 20px; margin-bottom: 6px; }
                    p { color: #666; margin-top: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background: #f3f4f6; }
                    td { vertical-align: top; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Data Jemaat</h1>
                <p>Tanggal cetak: ${new Date().toLocaleDateString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>NIK</th>
                            <th>Jenis Kelamin</th>
                            <th>Tanggal Lahir</th>
                            <th>Tempat Lahir</th>
                            <th>Umur</th>
                            <th>Status Baptis</th>
                            <th>Komisi</th>
                            <th>Telepon</th>
                            <th>Email</th>
                            <th>Alamat</th>
                            <th>Tanggal Bergabung</th>
                            <th>Status</th>
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
    },

    deleteMember(id) {
        if (!Auth.canDelete()) {
            Components.toast('Hanya admin yang dapat menghapus data.', 'warning');
            return;
        }
        const member = this.members.find(m => m.id === id);
        if (!member) return;

        Components.confirm(
            'Hapus Jemaat',
            `Apakah Anda yakin ingin menghapus ${member.name}? Tindakan ini tidak dapat dibatalkan.`,
            () => {
                AppData.deleteMember(id);
                Components.toast('Jemaat berhasil dihapus', 'success');
                this.render();
            }
        );
    }
};
