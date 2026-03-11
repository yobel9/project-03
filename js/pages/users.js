// ============================================
// Church Admin - User Management
// ============================================

const Users = {
    users: [],
    filteredUsers: [],
    filters: {
        search: ''
    },

    roleLabels: {
        admin: 'Admin',
        staff: 'Staff'
    },

    statusLabels: {
        active: 'Aktif',
        inactive: 'Nonaktif'
    },

    statusClasses: {
        active: 'badge-success',
        inactive: 'badge-danger'
    },

    async render() {
        this.users = AppData.getUsers();
        this.applyFilters();

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Manajemen User</h1>
                <button class="btn btn-primary" onclick="Users.showAddModal()">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M19 8V14M16 11H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    Tambah User
                </button>
            </div>

            <div class="card">
                <div class="filters">
                    <div class="filter-group">
                        <label>Cari:</label>
                        <input id="usersSearchInput" type="text" class="form-input" placeholder="Nama atau username..." value="${this.filters.search}" oninput="Users.handleSearch(this.value)">
                    </div>
                </div>

                <div class="table-container">
                    <table class="table events-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Status</th>
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
        const q = (this.filters.search || '').toLowerCase();
        this.filteredUsers = this.users.filter((item) =>
            !q
            || (item.name || '').toLowerCase().includes(q)
            || (item.username || '').toLowerCase().includes(q)
        );
    },

    renderRows() {
        if (!this.filteredUsers.length) {
            return `
                <tr>
                    <td colspan="5">
                        ${Components.emptyState(
                            '<svg viewBox="0 0 24 24" fill="none"><path d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>',
                            'Belum Ada User',
                            'Tambahkan user baru untuk akses aplikasi.'
                        )}
                    </td>
                </tr>
            `;
        }

        const currentUser = Auth.getCurrentUserSync();
        return this.filteredUsers.map((item) => `
            <tr>
                <td><strong>${item.name || '-'}</strong></td>
                <td>${item.username || '-'}</td>
                <td>${this.roleLabels[item.role] || '-'}</td>
                <td><span class="badge ${this.statusClasses[item.status] || 'badge-info'}">${this.statusLabels[item.status] || '-'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn edit" onclick="Users.showEditModal('${item.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        <button class="action-btn delete" onclick="Users.deleteUser('${item.id}')" title="Hapus" ${currentUser && currentUser.id === item.id ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    handleSearch(value) {
        this.filters.search = value;
        this.applyFilters();
        
        // Debounce render to prevent cursor jumping - longer delay
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        this.searchDebounceTimer = setTimeout(() => {
            // Save input element reference before render
            const input = document.getElementById('usersSearchInput');
            const savedValue = input ? input.value : value;
            const savedPos = input ? input.selectionStart : savedValue.length;
            
            this.render();
            
            // Restore input after render
            const newInput = document.getElementById('usersSearchInput');
            if (newInput) {
                newInput.value = savedValue;
                newInput.focus();
                if (savedPos <= savedValue.length) {
                    newInput.setSelectionRange(savedPos, savedPos);
                }
            }
        }, 300);
    },

    getFormHtml(item = {}) {
        const isEdit = Boolean(item.id);
        return `
            <form id="userForm">
                <input type="hidden" name="id" value="${item.id || ''}">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nama</label>
                        <input type="text" class="form-input" name="name" value="${item.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Username</label>
                        <input type="text" class="form-input" name="username" value="${item.username || ''}" ${isEdit ? 'readonly' : ''} required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label ${isEdit ? '' : 'required'}">Password ${isEdit ? '(Kosongkan jika tidak diubah)' : ''}</label>
                        <input type="password" class="form-input" name="password" ${isEdit ? '' : 'required'}>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Role</label>
                        <select class="form-select" name="role" required>
                            <option value="admin" ${item.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="staff" ${!item.role || item.role === 'staff' ? 'selected' : ''}>Staff</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label required">Status</label>
                    <select class="form-select" name="status" required>
                        <option value="active" ${item.status === 'active' || !item.status ? 'selected' : ''}>Aktif</option>
                        <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
                    </select>
                </div>
            </form>
        `;
    },

    showAddModal() {
        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Users.saveUser()">Simpan</button>
        `;
        Components.modal('Tambah User', this.getFormHtml(), footerHtml);
    },

    showEditModal(id) {
        const user = this.users.find((item) => item.id === id);
        if (!user) return;
        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Users.saveUser()">Simpan Perubahan</button>
        `;
        Components.modal('Edit User', this.getFormHtml(user), footerHtml);
    },

    saveUser() {
        const form = document.getElementById('userForm');
        const formData = Object.fromEntries(new FormData(form).entries());
        const isEdit = Boolean(formData.id);

        if (!formData.name || !formData.username || !formData.role || !formData.status) {
            Components.toast('Field wajib belum lengkap.', 'error');
            return;
        }
        if (!isEdit && !formData.password) {
            Components.toast('Password wajib diisi.', 'error');
            return;
        }

        const users = AppData.getUsers();
        const sameUsername = users.find((u) => u.username === formData.username && u.id !== formData.id);
        if (sameUsername) {
            Components.toast('Username sudah digunakan.', 'error');
            return;
        }

        if (isEdit) {
            const current = users.find((u) => u.id === formData.id);
            const activeAdmins = users.filter((u) => u.role === 'admin' && u.status === 'active');
            const isDowngradingLastAdmin = current
                && current.role === 'admin'
                && current.status === 'active'
                && activeAdmins.length === 1
                && (formData.role !== 'admin' || formData.status !== 'active');
            if (isDowngradingLastAdmin) {
                Components.toast('Minimal harus ada 1 admin aktif.', 'error');
                return;
            }

            const updates = {
                name: formData.name.trim(),
                role: formData.role,
                status: formData.status
            };
            if (formData.password) {
                updates.password = formData.password;
            }
            AppData.updateUser(formData.id, updates);
            Components.toast('User berhasil diperbarui.', 'success');
        } else {
            AppData.addUser({
                name: formData.name.trim(),
                username: formData.username.trim(),
                password: formData.password,
                role: formData.role,
                status: formData.status
            });
            Components.toast('User berhasil ditambahkan.', 'success');
        }

        Components.closeModal();
        this.render();
    },

    deleteUser(id) {
        if (!Auth.canDeleteSync()) {
            Components.toast('Hanya admin yang dapat menghapus data.', 'warning');
            return;
        }
        const currentUser = Auth.getCurrentUserSync();
        if (currentUser && currentUser.id === id) {
            Components.toast('User yang sedang login tidak bisa dihapus.', 'warning');
            return;
        }

        const user = this.users.find((item) => item.id === id);
        if (!user) return;

        const activeAdmins = this.users.filter((u) => u.role === 'admin' && u.status === 'active');
        if (user.role === 'admin' && user.status === 'active' && activeAdmins.length === 1) {
            Components.toast('Admin aktif terakhir tidak bisa dihapus.', 'error');
            return;
        }

        Components.confirm(
            'Hapus User',
            `Apakah Anda yakin ingin menghapus user ${user.username}?`,
            () => {
                AppData.deleteUser(id);
                Components.toast('User berhasil dihapus.', 'success');
                this.render();
            }
        );
    }
};
