// ============================================
// Church Admin - Commissions Page
// ============================================

const Commissions = {
    members: [],
    filteredMembers: [],
    currentPage: 1,
    itemsPerPage: 10,
    currentCommission: 'all',
    commissionLabels: {
        all: 'Semua Komisi',
        sunday_school: 'Komisi Sekolah Minggu',
        youth: 'Komisi Pemuda Remaja',
        men: 'Komisi Pria',
        women: 'Komisi Wanita'
    },

    render(commission = 'all') {
        if (this.currentCommission !== commission) {
            this.currentPage = 1;
        }

        this.currentCommission = commission;
        this.members = AppData.getMembers();
        this.applyFilter();

        const commissionLabel = this.commissionLabels[commission] || 'Komisi';

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">${commissionLabel}</h1>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="Commissions.exportCommissionExcel()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V3M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Export Komisi
                    </button>
                    <button class="btn btn-secondary" onclick="Commissions.printCommission()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2"/><path d="M6 18H5A2 2 0 0 1 3 16V11A2 2 0 0 1 5 9H19A2 2 0 0 1 21 11V16A2 2 0 0 1 19 18H18" stroke="currentColor" stroke-width="2"/><rect x="6" y="14" width="12" height="8" stroke="currentColor" stroke-width="2"/></svg>
                        Print Komisi
                    </button>
                    <button class="btn btn-primary" onclick="Members.showAddModal()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Tambah Jemaat
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Jenis Kelamin</th>
                                <th>Umur</th>
                                <th>Status Baptis</th>
                                <th>Telepon</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderTableRows()}
                        </tbody>
                    </table>
                </div>

                ${this.renderPagination()}
            </div>
        `;
    },

    applyFilter() {
        this.filteredMembers = this.members.filter((member) => {
            if (this.currentCommission === 'all') return true;
            return member.commission === this.currentCommission;
        });
    },

    getAgeValue(birthDate) {
        if (!birthDate) return null;

        const today = new Date();
        const dob = new Date(birthDate);
        if (Number.isNaN(dob.getTime())) return null;

        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const hasHadBirthday = monthDiff > 0 || (monthDiff === 0 && today.getDate() >= dob.getDate());

        if (!hasHadBirthday) age -= 1;
        return age >= 0 ? age : null;
    },

    getAge(birthDate) {
        const age = this.getAgeValue(birthDate);
        return age === null ? '-' : `${age} th`;
    },

    getBaptismStatusLabel(status) {
        if (status === 'baptized') return 'Sudah Baptis';
        if (status === 'not_baptized') return 'Belum Baptis';
        return '-';
    },

    renderTableRows() {
        if (!this.filteredMembers.length) {
            return `
                <tr>
                    <td colspan="7">
                        ${Components.emptyState(
                            '<svg viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>',
                            'Tidak Ada Data',
                            'Belum ada jemaat pada komisi ini.'
                        )}
                    </td>
                </tr>
            `;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const pageMembers = this.filteredMembers.slice(startIndex, startIndex + this.itemsPerPage);
        const canDelete = Auth.canDelete();

        return pageMembers.map((member) => `
            <tr>
                <td>
                    <div class="member-cell">
                        <div class="member-avatar">${Components.getInitials(member.name)}</div>
                        <span>${member.name}</span>
                    </div>
                </td>
                <td>${member.gender === 'Male' ? 'Laki-laki' : member.gender === 'Female' ? 'Perempuan' : '-'}</td>
                <td>${this.getAge(member.birthDate)}</td>
                <td>${this.getBaptismStatusLabel(member.baptismStatus)}</td>
                <td>${member.phone || '-'}</td>
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

    renderPagination() {
        const totalPages = Math.ceil(this.filteredMembers.length / this.itemsPerPage);
        return Components.pagination(this.currentPage, totalPages, 'Commissions.changePage');
    },

    changePage(page) {
        this.currentPage = page;
        this.render(this.currentCommission);
        document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
    },

    exportCommissionExcel() {
        if (!this.filteredMembers.length) {
            Components.toast('Tidak ada data komisi untuk diexport', 'warning');
            return;
        }

        if (typeof XLSX === 'undefined') {
            Components.toast('Library Excel belum tersedia. Refresh halaman lalu coba lagi.', 'error');
            return;
        }

        const rows = this.filteredMembers.map((member) => ({
            Nama: member.name || '',
            NIK: member.nik || '',
            'Jenis Kelamin': member.gender === 'Male' ? 'Laki-laki' : member.gender === 'Female' ? 'Perempuan' : '',
            Umur: this.getAge(member.birthDate),
            'Status Baptis': this.getBaptismStatusLabel(member.baptismStatus),
            Komisi: this.commissionLabels[member.commission] || '-',
            Telepon: member.phone || '',
            Email: member.email || '',
            Status: member.status === 'active' ? 'Aktif' : 'Tidak Aktif'
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Komisi');

        const slug = this.currentCommission === 'all' ? 'semua-komisi' : this.currentCommission;
        XLSX.writeFile(workbook, `komisi-${slug}.xlsx`);
        Components.toast('Data komisi berhasil diexport', 'success');
    },

    printCommission() {
        if (!this.filteredMembers.length) {
            Components.toast('Tidak ada data komisi untuk dicetak', 'warning');
            return;
        }

        const commissionLabel = this.commissionLabels[this.currentCommission] || 'Komisi';
        const rows = this.filteredMembers.map((member, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${member.name || '-'}</td>
                <td>${member.gender === 'Male' ? 'Laki-laki' : member.gender === 'Female' ? 'Perempuan' : '-'}</td>
                <td>${this.getAge(member.birthDate)}</td>
                <td>${this.getBaptismStatusLabel(member.baptismStatus)}</td>
                <td>${member.phone || '-'}</td>
                <td>${member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</td>
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
                <title>Print ${commissionLabel}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; }
                    h1 { font-size: 20px; margin-bottom: 6px; }
                    p { color: #666; margin-top: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background: #f3f4f6; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>${commissionLabel}</h1>
                <p>Tanggal cetak: ${new Date().toLocaleDateString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Jenis Kelamin</th>
                            <th>Umur</th>
                            <th>Status Baptis</th>
                            <th>Telepon</th>
                            <th>Status</th>
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
