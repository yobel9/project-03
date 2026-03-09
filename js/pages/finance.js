// ============================================
// Church Admin - Finance Page
// ============================================

const Finance = {
    incomes: [],
    expenses: [],
    transactions: [],
    filteredTransactions: [],
    currentPage: 1,
    itemsPerPage: 10,
    sort: {
        field: 'date',
        direction: 'desc'
    },
    filters: {
        dateFrom: '',
        dateTo: '',
        type: '',
        category: ''
    },

    incomeCategories: {
        tithe: 'Persepuluhan',
        offering: 'Kolekte',
        building: 'Building Fund',
        special: 'Donasi Khusus',
        other: 'Lainnya'
    },

    expenseCategories: {
        operational: 'Operasional',
        maintenance: 'Pemeliharaan',
        utility: 'Utilitas',
        social: 'Sosial',
        ministry: 'Pelayanan',
        salary: 'Honorarium',
        other_expense: 'Lainnya'
    },

    render() {
        this.incomes = AppData.getDonations();
        this.expenses = AppData.getExpenses();
        this.buildTransactions();
        this.applyFilters();

        const stats = this.getStats();

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Kas Gereja</h1>
                <div class="finance-header-actions">
                    <button class="btn btn-secondary" onclick="Finance.printReport()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2"/><path d="M6 18H5A2 2 0 0 1 3 16V11A2 2 0 0 1 5 9H19A2 2 0 0 1 21 11V16A2 2 0 0 1 19 18H18" stroke="currentColor" stroke-width="2"/><rect x="6" y="14" width="12" height="8" stroke="currentColor" stroke-width="2"/></svg>
                        Cetak Laporan
                    </button>
                    <button class="btn btn-primary" onclick="Finance.showAddModal()">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Tambah Transaksi
                    </button>
                </div>
            </div>

            <div class="finance-summary">
                <div class="finance-card highlight">
                    <div class="finance-label">Saldo Kas</div>
                    <div class="finance-value">Rp ${AppData.formatCurrency(stats.balance)}</div>
                </div>
                <div class="finance-card">
                    <div class="finance-label">Total Pemasukan</div>
                    <div class="finance-value">Rp ${AppData.formatCurrency(stats.totalIncome)}</div>
                </div>
                <div class="finance-card">
                    <div class="finance-label">Total Pengeluaran</div>
                    <div class="finance-value">Rp ${AppData.formatCurrency(stats.totalExpense)}</div>
                </div>
                <div class="finance-card">
                    <div class="finance-label">Arus Bulan Ini</div>
                    <div class="finance-value">Rp ${AppData.formatCurrency(stats.monthFlow)}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Riwayat Transaksi Kas</h3>
                </div>

                <div class="filters">
                    <div class="filter-group">
                        <label>Dari:</label>
                        <input type="date" class="form-input" value="${this.filters.dateFrom}" 
                               onchange="Finance.handleDateFrom(this.value)">
                    </div>
                    <div class="filter-group">
                        <label>Sampai:</label>
                        <input type="date" class="form-input" value="${this.filters.dateTo}" 
                               onchange="Finance.handleDateTo(this.value)">
                    </div>
                    <div class="filter-group">
                        <label>Jenis:</label>
                        <select class="form-select" onchange="Finance.handleTypeFilter(this.value)">
                            <option value="">Semua</option>
                            <option value="income" ${this.filters.type === 'income' ? 'selected' : ''}>Pemasukan</option>
                            <option value="expense" ${this.filters.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Kategori:</label>
                        <select class="form-select" onchange="Finance.handleCategoryFilter(this.value)">
                            <option value="">Semua</option>
                            <optgroup label="Pemasukan">
                                <option value="tithe" ${this.filters.category === 'tithe' ? 'selected' : ''}>Persepuluhan</option>
                                <option value="offering" ${this.filters.category === 'offering' ? 'selected' : ''}>Kolekte</option>
                                <option value="building" ${this.filters.category === 'building' ? 'selected' : ''}>Building Fund</option>
                                <option value="special" ${this.filters.category === 'special' ? 'selected' : ''}>Donasi Khusus</option>
                                <option value="other" ${this.filters.category === 'other' ? 'selected' : ''}>Lainnya</option>
                            </optgroup>
                            <optgroup label="Pengeluaran">
                                <option value="operational" ${this.filters.category === 'operational' ? 'selected' : ''}>Operasional</option>
                                <option value="maintenance" ${this.filters.category === 'maintenance' ? 'selected' : ''}>Pemeliharaan</option>
                                <option value="utility" ${this.filters.category === 'utility' ? 'selected' : ''}>Utilitas</option>
                                <option value="social" ${this.filters.category === 'social' ? 'selected' : ''}>Sosial</option>
                                <option value="ministry" ${this.filters.category === 'ministry' ? 'selected' : ''}>Pelayanan</option>
                                <option value="salary" ${this.filters.category === 'salary' ? 'selected' : ''}>Honorarium</option>
                                <option value="other_expense" ${this.filters.category === 'other_expense' ? 'selected' : ''}>Lainnya</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table finance-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th class="sortable" onclick="Finance.handleSort('date')">Tanggal ${this.getSortIndicator('date')}</th>
                                <th>Jenis</th>
                                <th>Kategori</th>
                                <th>Metode</th>
                                <th class="sortable" onclick="Finance.handleSort('amount')">Jumlah ${this.getSortIndicator('amount')}</th>
                                <th>Catatan</th>
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

    buildTransactions() {
        const incomeTransactions = this.incomes.map((income) => ({
            id: `inc-${income.id}`,
            rawId: income.id,
            type: 'income',
            date: income.date,
            partyName: income.donorName,
            amount: Number(income.amount) || 0,
            category: income.category,
            paymentMethod: income.paymentMethod,
            notes: income.notes || '',
            proofImage: income.proofImage || ''
        }));

        const expenseTransactions = this.expenses.map((expense) => ({
            id: `exp-${expense.id}`,
            rawId: expense.id,
            type: 'expense',
            date: expense.date,
            partyName: expense.partyName,
            amount: Number(expense.amount) || 0,
            category: expense.category,
            paymentMethod: expense.paymentMethod,
            notes: expense.notes || '',
            proofImage: expense.proofImage || ''
        }));

        this.transactions = [...incomeTransactions, ...expenseTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getStats() {
        const now = new Date();
        const thisMonth = now.toISOString().slice(0, 7);

        const totalIncome = this.incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const totalExpense = this.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const monthIncome = this.incomes
            .filter((item) => item.date?.slice(0, 7) === thisMonth)
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const monthExpense = this.expenses
            .filter((item) => item.date?.slice(0, 7) === thisMonth)
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            monthFlow: monthIncome - monthExpense
        };
    },

    getCategoryLabel(type, category) {
        const map = type === 'income' ? this.incomeCategories : this.expenseCategories;
        return map[category] || '-';
    },

    getTypeBadge(type) {
        if (type === 'income') return '<span class="badge badge-success">Pemasukan</span>';
        return '<span class="badge badge-danger">Pengeluaran</span>';
    },

    renderTableRows() {
        if (this.filteredTransactions.length === 0) {
            return `
                <tr>
                    <td colspan="8">
                        ${Components.emptyState(
                            '<svg viewBox="0 0 24 24" fill="none"><path d="M12 1V23" stroke="currentColor" stroke-width="2"/><path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/></svg>',
                            'Tidak Ada Data',
                            'Belum ada data transaksi kas.',
                            'Tambah Transaksi',
                            'Finance.showAddModal()'
                        )}
                    </td>
                </tr>
            `;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, startIndex + this.itemsPerPage);

        const isMobile = window.innerWidth <= 900;
        const canDelete = Auth.canDelete();

        if (isMobile) {
            return pageTransactions.map((tx) => `
                <tr>
                    <td colspan="8" style="padding: 0;">
                        <div style="padding: 16px; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-weight: 600;">${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
                                ${this.getTypeBadge(tx.type)}
                            </div>
                            <div style="font-size: 1.143rem; font-weight: 700; color: ${tx.type === 'income' ? 'var(--accent)' : 'var(--danger)'}; margin-bottom: 8px;">
                                ${tx.type === 'income' ? '+' : '-'} Rp ${AppData.formatCurrency(tx.amount)}
                            </div>
                            <div style="font-size: 0.857rem; color: var(--text-secondary);">
                                <div>📅 ${Components.formatDate(tx.date)}</div>
                                <div>🏷️ ${this.getCategoryLabel(tx.type, tx.category)}</div>
                                <div>💳 ${tx.paymentMethod || '-'}</div>
                                ${tx.notes ? `<div>📝 ${tx.notes}</div>` : ''}
                            </div>
                            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                                <button class="btn btn-sm btn-secondary" onclick="Finance.showDetailModal('${tx.id}')">Detail</button>
                                <button class="btn btn-sm btn-secondary" onclick="Finance.showEditModal('${tx.id}')">Edit</button>
                                ${canDelete ? `<button class="btn btn-sm btn-danger" onclick="Finance.deleteTransaction('${tx.id}')">Hapus</button>` : ''}
                            </div>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        return pageTransactions.map((tx, index) => `
            <tr>
                <td>${startIndex + index + 1}</td>
                <td>${Components.formatDate(tx.date)}</td>
                <td>${this.getTypeBadge(tx.type)}</td>
                <td>${this.getCategoryLabel(tx.type, tx.category)}</td>
                <td>${tx.paymentMethod || '-'}</td>
                <td><strong style="color: ${tx.type === 'income' ? 'var(--accent)' : 'var(--danger)'};">${tx.type === 'income' ? '+' : '-'} Rp ${AppData.formatCurrency(tx.amount)}</strong></td>
                <td>${tx.notes || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="Finance.showDetailModal('${tx.id}')" title="Detail">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        <button class="action-btn edit" onclick="Finance.showEditModal('${tx.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                        ${canDelete ? `
                            <button class="action-btn delete" onclick="Finance.deleteTransaction('${tx.id}')" title="Hapus">
                                <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderPagination() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        return Components.pagination(this.currentPage, totalPages, 'Finance.changePage');
    },

    changePage(page) {
        this.currentPage = page;
        this.render();
    },

    applyFilters(resetPage = false) {
        this.filteredTransactions = this.transactions.filter((tx) => {
            const matchDateFrom = !this.filters.dateFrom || tx.date >= this.filters.dateFrom;
            const matchDateTo = !this.filters.dateTo || tx.date <= this.filters.dateTo;
            const matchType = !this.filters.type || tx.type === this.filters.type;
            const matchCategory = !this.filters.category || tx.category === this.filters.category;
            return matchDateFrom && matchDateTo && matchType && matchCategory;
        });

        this.applySorting();

        if (resetPage) {
            this.currentPage = 1;
        }
    },

    applySorting() {
        const { field, direction } = this.sort;
        const multiplier = direction === 'asc' ? 1 : -1;

        this.filteredTransactions.sort((a, b) => {
            if (field === 'date') {
                return (new Date(a.date) - new Date(b.date)) * multiplier;
            }

            if (field === 'amount') {
                return ((Number(a.amount) || 0) - (Number(b.amount) || 0)) * multiplier;
            }

            if (field === 'partyName') {
                return (a.partyName || '').localeCompare(b.partyName || '', 'id') * multiplier;
            }

            return 0;
        });
    },

    handleSort(field) {
        if (this.sort.field === field) {
            this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sort.field = field;
            this.sort.direction = field === 'date' ? 'desc' : 'asc';
        }
        this.applyFilters();
        this.render();
    },

    getSortIndicator(field) {
        if (this.sort.field !== field) return '<>';
        return this.sort.direction === 'asc' ? '^' : 'v';
    },

    handleDateFrom(value) {
        this.filters.dateFrom = value;
        this.applyFilters(true);
        this.render();
    },

    handleDateTo(value) {
        this.filters.dateTo = value;
        this.applyFilters(true);
        this.render();
    },

    handleTypeFilter(value) {
        this.filters.type = value;
        this.applyFilters(true);
        this.render();
    },

    handleCategoryFilter(value) {
        this.filters.category = value;
        this.applyFilters(true);
        this.render();
    },

    getCategoryOptions(type, selected = '') {
        const categories = type === 'expense' ? this.expenseCategories : this.incomeCategories;
        return Object.entries(categories)
            .map(([value, label]) => `<option value="${value}" ${selected === value ? 'selected' : ''}>${label}</option>`)
            .join('');
    },

    updateCategoryOptions(type) {
        const select = document.querySelector('#financeTransactionForm select[name="category"]');
        if (!select) return;
        select.innerHTML = `<option value="">Pilih...</option>${this.getCategoryOptions(type)}`;
    },

    showAddModal() {
        const bodyHtml = `
            <form id="financeTransactionForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Jenis Transaksi</label>
                        <select class="form-select" name="type" onchange="Finance.updateCategoryOptions(this.value)" required>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Tanggal</label>
                        <input type="date" class="form-input" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nama / Pihak</label>
                        <input type="text" class="form-input" name="partyName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Jumlah (Rp)</label>
                        <input type="number" class="form-input" name="amount" min="0" placeholder="0" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Kategori</label>
                        <select class="form-select" name="category" required>
                            <option value="">Pilih...</option>
                            ${this.getCategoryOptions('income')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Metode Pembayaran</label>
                        <select class="form-select" name="paymentMethod" required>
                            <option value="">Pilih...</option>
                            <option value="Cash">Tunai</option>
                            <option value="Transfer">Transfer Bank</option>
                            <option value="QRIS">QRIS</option>
                            <option value="Other">Lainnya</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-textarea" name="notes" rows="2" placeholder="Opsional..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Bukti Transaksi (Nota)</label>
                    <input type="file" class="form-input" name="proofFile" accept="image/*">
                    <input type="hidden" name="proofImage" value="">
                </div>
            </form>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Finance.saveTransaction()">Simpan</button>
        `;

        Components.modal('Tambah Transaksi Kas', bodyHtml, footerHtml);
    },

    async saveTransaction() {
        const form = document.getElementById('financeTransactionForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const proofFile = form.querySelector('input[name="proofFile"]')?.files?.[0];

        if (!data.type || !data.date || !data.partyName || !data.amount || !data.category || !data.paymentMethod) {
            Components.toast('Mohon lengkapi data yang wajib diisi', 'error');
            return;
        }

        if (Number(data.amount) <= 0) {
            Components.toast('Jumlah harus lebih dari 0', 'error');
            return;
        }

        let proofImage = data.proofImage || '';
        try {
            if (proofFile) {
                proofImage = await this.fileToDataUrl(proofFile);
            }
        } catch (error) {
            Components.toast(error.message, 'error');
            return;
        }

        if (data.type === 'income') {
            AppData.addDonation({
                date: data.date,
                donorName: data.partyName,
                amount: data.amount,
                category: data.category,
                paymentMethod: data.paymentMethod,
                notes: data.notes || '',
                proofImage
            });
            Components.toast('Pemasukan berhasil ditambahkan', 'success');
        } else {
            AppData.addExpense({
                date: data.date,
                partyName: data.partyName,
                amount: data.amount,
                category: data.category,
                paymentMethod: data.paymentMethod,
                notes: data.notes || '',
                proofImage
            });
            Components.toast('Pengeluaran berhasil ditambahkan', 'success');
        }

        Components.closeModal();
        this.render();
    },

    getTransactionById(id) {
        return this.transactions.find(tx => tx.id === id);
    },

    showEditModal(id) {
        const tx = this.getTransactionById(id);
        if (!tx) return;

        const bodyHtml = `
            <form id="financeEditForm">
                <input type="hidden" name="id" value="${tx.id}">
                <input type="hidden" name="type" value="${tx.type}">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Jenis Transaksi</label>
                        <input type="text" class="form-input" value="${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Tanggal</label>
                        <input type="date" class="form-input" name="date" value="${tx.date}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Nama / Pihak</label>
                        <input type="text" class="form-input" name="partyName" value="${tx.partyName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Jumlah (Rp)</label>
                        <input type="number" class="form-input" name="amount" min="0" value="${tx.amount}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Kategori</label>
                        <select class="form-select" name="category" required>
                            <option value="">Pilih...</option>
                            ${this.getCategoryOptions(tx.type, tx.category)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Metode Pembayaran</label>
                        <select class="form-select" name="paymentMethod" required>
                            <option value="">Pilih...</option>
                            <option value="Cash" ${tx.paymentMethod === 'Cash' ? 'selected' : ''}>Tunai</option>
                            <option value="Transfer" ${tx.paymentMethod === 'Transfer' ? 'selected' : ''}>Transfer Bank</option>
                            <option value="QRIS" ${tx.paymentMethod === 'QRIS' ? 'selected' : ''}>QRIS</option>
                            <option value="Other" ${tx.paymentMethod === 'Other' ? 'selected' : ''}>Lainnya</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Catatan</label>
                    <textarea class="form-textarea" name="notes" rows="2">${tx.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Bukti Transaksi (Nota)</label>
                    <input type="file" class="form-input" name="proofFile" accept="image/*">
                    <input type="hidden" name="proofImage" value="${tx.proofImage || ''}">
                    ${tx.proofImage ? `
                    <div style="margin-top: 8px;">
                        <img src="${tx.proofImage}" alt="Bukti nota" style="max-width: 100%; max-height: 180px; border: 1px solid var(--border); border-radius: var(--radius);">
                    </div>
                    ` : ''}
                </div>
            </form>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="Finance.saveEditedTransaction()">Simpan Perubahan</button>
        `;

        Components.modal('Edit Transaksi Kas', bodyHtml, footerHtml);
    },

    async saveEditedTransaction() {
        const form = document.getElementById('financeEditForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const proofFile = form.querySelector('input[name="proofFile"]')?.files?.[0];

        if (!data.id || !data.type || !data.date || !data.partyName || !data.amount || !data.category || !data.paymentMethod) {
            Components.toast('Mohon lengkapi data yang wajib diisi', 'error');
            return;
        }

        if (Number(data.amount) <= 0) {
            Components.toast('Jumlah harus lebih dari 0', 'error');
            return;
        }

        let proofImage = data.proofImage || '';
        try {
            if (proofFile) {
                proofImage = await this.fileToDataUrl(proofFile);
            }
        } catch (error) {
            Components.toast(error.message, 'error');
            return;
        }

        const rawId = data.id.replace(/^inc-|^exp-/, '');

        if (data.type === 'income') {
            AppData.updateDonation(rawId, {
                date: data.date,
                donorName: data.partyName,
                amount: data.amount,
                category: data.category,
                paymentMethod: data.paymentMethod,
                notes: data.notes || '',
                proofImage
            });
            Components.toast('Pemasukan berhasil diperbarui', 'success');
        } else {
            AppData.updateExpense(rawId, {
                date: data.date,
                partyName: data.partyName,
                amount: data.amount,
                category: data.category,
                paymentMethod: data.paymentMethod,
                notes: data.notes || '',
                proofImage
            });
            Components.toast('Pengeluaran berhasil diperbarui', 'success');
        }

        Components.closeModal();
        this.render();
    },

    showDetailModal(id) {
        const tx = this.getTransactionById(id);
        if (!tx) return;

        const bodyHtml = `
            <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Jenis</span>
                    <span>${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Tanggal</span>
                    <span>${Components.formatDate(tx.date)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Nama / Pihak</span>
                    <span>${tx.partyName || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Kategori</span>
                    <span>${this.getCategoryLabel(tx.type, tx.category)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Jumlah</span>
                    <span style="font-weight: 700; color: ${tx.type === 'income' ? 'var(--accent)' : 'var(--danger)'};">
                        ${tx.type === 'income' ? '+' : '-'} Rp ${AppData.formatCurrency(tx.amount)}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Metode</span>
                    <span>${tx.paymentMethod || '-'}</span>
                </div>
                <div style="padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary); display: block; margin-bottom: 4px;">Catatan</span>
                    <span>${tx.notes || '-'}</span>
                </div>
                <div style="padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary); display: block; margin-bottom: 8px;">Bukti Nota</span>
                    ${tx.proofImage
                        ? `<img src="${tx.proofImage}" alt="Bukti nota" style="max-width: 100%; max-height: 280px; border: 1px solid var(--border); border-radius: var(--radius);">`
                        : '<span>-</span>'
                    }
                </div>
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
            <button class="btn btn-primary" onclick="Components.closeModal(); Finance.showEditModal('${tx.id}')">Edit</button>
        `;

        Components.modal('Detail Transaksi', bodyHtml, footerHtml);
    },

    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Gagal membaca file bukti transaksi'));
            reader.readAsDataURL(file);
        });
    },

    deleteTransaction(id) {
        if (!Auth.canDelete()) {
            Components.toast('Hanya admin yang dapat menghapus data.', 'warning');
            return;
        }
        const tx = this.getTransactionById(id);
        if (!tx) return;

        Components.confirm(
            'Hapus Transaksi',
            `Apakah Anda yakin ingin menghapus transaksi ${tx.partyName || '-'}?`,
            () => {
                if (tx.type === 'income') {
                    AppData.deleteDonation(tx.rawId);
                } else {
                    AppData.deleteExpense(tx.rawId);
                }
                Components.toast('Transaksi berhasil dihapus', 'success');
                this.render();
            }
        );
    },

    printReport() {
        if (!this.filteredTransactions.length) {
            Components.toast('Tidak ada data transaksi untuk dicetak', 'warning');
            return;
        }

        const getFilterCategoryLabel = (category) => {
            if (!category) return '';
            return this.incomeCategories[category] || this.expenseCategories[category] || '-';
        };

        const totals = this.filteredTransactions.reduce((acc, tx) => {
            if (tx.type === 'income') acc.income += tx.amount;
            else acc.expense += tx.amount;
            return acc;
        }, { income: 0, expense: 0 });

        const balance = totals.income - totals.expense;
        const filterInfo = [
            this.filters.dateFrom ? `Dari: ${Components.formatDate(this.filters.dateFrom)}` : '',
            this.filters.dateTo ? `Sampai: ${Components.formatDate(this.filters.dateTo)}` : '',
            this.filters.type ? `Jenis: ${this.filters.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}` : '',
            this.filters.category ? `Kategori: ${getFilterCategoryLabel(this.filters.category)}` : ''
        ].filter(Boolean).join(' | ');

        const rows = this.filteredTransactions.map((tx, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${Components.formatDate(tx.date)}</td>
                <td>${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                <td>${tx.partyName || '-'}</td>
                <td>${this.getCategoryLabel(tx.type, tx.category)}</td>
                <td>${tx.paymentMethod || '-'}</td>
                <td style="color: ${tx.type === 'income' ? '#2f855a' : '#c53030'}; font-weight: 700;">${tx.type === 'income' ? '+' : '-'} Rp ${AppData.formatCurrency(tx.amount)}</td>
                <td>${tx.notes || '-'}</td>
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
                <title>Laporan Keuangan Gereja</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
                    h1 { font-size: 20px; margin-bottom: 4px; }
                    p { color: #6b7280; margin: 2px 0; font-size: 12px; }
                    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 14px 0; }
                    .box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
                    .label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
                    .value { font-size: 14px; font-weight: 700; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #e5e7eb; padding: 7px; text-align: left; font-size: 11px; vertical-align: top; }
                    th { background: #f3f4f6; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Laporan Keuangan Gereja</h1>
                <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
                ${filterInfo ? `<p>Filter: ${filterInfo}</p>` : '<p>Filter: Semua data transaksi</p>'}
                <div class="summary">
                    <div class="box">
                        <div class="label">Total Pemasukan</div>
                        <div class="value" style="color:#2f855a;">Rp ${AppData.formatCurrency(totals.income)}</div>
                    </div>
                    <div class="box">
                        <div class="label">Total Pengeluaran</div>
                        <div class="value" style="color:#c53030;">Rp ${AppData.formatCurrency(totals.expense)}</div>
                    </div>
                    <div class="box">
                        <div class="label">Saldo</div>
                        <div class="value">Rp ${AppData.formatCurrency(balance)}</div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Tanggal</th>
                            <th>Jenis</th>
                            <th>Nama / Pihak</th>
                            <th>Kategori</th>
                            <th>Metode</th>
                            <th>Jumlah</th>
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
