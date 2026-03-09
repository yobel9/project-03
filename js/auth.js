// ============================================
// Church Admin - Local Auth
// ============================================

const Auth = {
    sessionKey: 'churchAdminSession',

    getSession() {
        const raw = localStorage.getItem(this.sessionKey);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    },

    getCurrentUser() {
        const session = this.getSession();
        if (!session || !session.userId) return null;
        const user = AppData.getUsers().find((item) => item.id === session.userId);
        if (!user || user.status !== 'active') return null;
        return user;
    },

    isAuthenticated() {
        return Boolean(this.getCurrentUser());
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return Boolean(user && user.role === 'admin');
    },

    canDelete() {
        return this.isAdmin();
    },

    login(username, password) {
        const user = AppData.getUsers().find((item) =>
            item.username === username && item.password === password && item.status === 'active'
        );

        if (!user) return false;

        localStorage.setItem(this.sessionKey, JSON.stringify({
            userId: user.id,
            loginAt: new Date().toISOString()
        }));
        return true;
    },

    logout() {
        localStorage.removeItem(this.sessionKey);
        window.location.reload();
    },

    requireAuth() {
        if (this.isAuthenticated()) {
            document.body.classList.remove('auth-screen');
            return true;
        }
        this.renderLogin();
        return false;
    },

    renderLogin(errorMessage = '') {
        document.body.classList.add('auth-screen');
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="auth-card">
                <div style="text-align:center; margin-bottom: 20px;">
                    <h2 style="margin-bottom:6px;">Login Admin Gereja</h2>
                    <p style="margin:0; color: var(--text-secondary);">Silakan masuk untuk melanjutkan</p>
                </div>
                ${errorMessage ? `<div style="background: rgba(229,62,62,0.1); color: var(--danger); border:1px solid rgba(229,62,62,0.2); border-radius: 8px; padding: 10px; margin-bottom: 12px;">${errorMessage}</div>` : ''}
                <form id="loginForm">
                    <div class="form-group">
                        <label class="form-label required">Username</label>
                        <input type="text" class="form-input" name="username" required autofocus>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Password</label>
                        <input type="password" class="form-input" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Masuk</button>
                </form>
                <p style="margin-top: 12px; color: var(--text-muted); font-size: 0.85rem; text-align:center;">
                    Default: <strong>admin</strong> / <strong>admin123</strong>
                </p>
            </div>
        `;

        const form = document.getElementById('loginForm');
        form?.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = Object.fromEntries(new FormData(form).entries());
            const ok = this.login(formData.username?.trim(), formData.password || '');
            if (!ok) {
                this.renderLogin('Username atau password salah.');
                return;
            }
            window.location.reload();
        });
    }
};
