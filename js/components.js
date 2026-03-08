// ============================================
// Church Admin - UI Components
// ============================================

const Components = {
    // Toast notifications
    toast(message, type = 'info', title = '') {
        const container = document.getElementById('toastContainer');
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2.00 20.3 2.26 20.56 2.57 20.74C2.88 20.92 3.23 21.01 3.59 21H20.41C20.77 21.01 21.12 20.92 21.43 20.74C21.74 20.56 22.00 20.3 22.18 20C22.36 19.7 22.45 19.36 22.45 19C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.96 3.15C12.65 2.98 12.30 2.89 11.94 2.89C11.58 2.89 11.23 2.98 10.92 3.15C10.61 3.32 10.35 3.56 10.17 3.86H10.29Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        };

        const titles = {
            success: title || 'Berhasil',
            error: title || 'Error',
            warning: title || 'Peringatan',
            info: title || 'Informasi'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    },

    // Modal
    modal(title, bodyHtml, footerHtml = '') {
        const overlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHtml;
        modalFooter.innerHTML = footerHtml;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        };

        // Close button
        document.getElementById('modalClose').onclick = () => {
            this.closeModal();
        };

        // Close on escape
        document.onkeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        };
    },

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.onkeydown = null;
    },

    // Confirm dialog
    confirm(title, message, onConfirm) {
        const bodyHtml = `<p style="margin: 0; color: var(--text-secondary);">${message}</p>`;
        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
            <button class="btn btn-danger" id="confirmBtn">Hapus</button>
        `;

        this.modal(title, bodyHtml, footerHtml);

        document.getElementById('confirmBtn').onclick = () => {
            onConfirm();
            this.closeModal();
        };
    },

    // Stat card
    statCard(icon, label, value, change = '', changeType = '') {
        return `
            <div class="stat-card">
                <div class="stat-icon ${icon.type}">
                    ${icon.svg}
                </div>
                <div class="stat-content">
                    <div class="stat-label">${label}</div>
                    <div class="stat-value">${value}</div>
                    ${change ? `<div class="stat-change ${changeType}">${change}</div>` : ''}
                </div>
            </div>
        `;
    },

    // Format date
    formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    },

    // Format time
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    },

    // Get initials
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    // Empty state
    emptyState(icon, title, message, buttonText = '', buttonAction = '') {
        return `
            <div class="empty-state">
                ${icon}
                <h3>${title}</h3>
                <p>${message}</p>
                ${buttonText ? `<button class="btn btn-primary" onclick="${buttonAction}">${buttonText}</button>` : ''}
            </div>
        `;
    },

    // Keep text input focused after page re-render (used by live search fields)
    preserveInputFocus(inputId, value = '') {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.focus();
        const cursorPos = String(value).length;
        input.setSelectionRange(cursorPos, cursorPos);
    },

    // Loading spinner
    loading() {
        return '<div class="loading" style="text-align: center; padding: 40px;"><span style="display: inline-block; width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite;"></span></div>';
    },

    // Pagination
    pagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';

        let pages = '';
        for (let i = 1; i <= totalPages; i++) {
            pages += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="${onPageChange}(${i})">${i}</button>
            `;
        }

        return `
            <div class="pagination">
                <div class="pagination-info">
                    Halaman ${currentPage} dari ${totalPages}
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn" onclick="${onPageChange}(${currentPage - 1})" 
                            ${currentPage === 1 ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    ${pages}
                    <button class="pagination-btn" onclick="${onPageChange}(${currentPage + 1})" 
                            ${currentPage === totalPages ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
            </div>
        `;
    }
};

// Add animation keyframes for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
