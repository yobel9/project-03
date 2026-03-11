// Chat Page - Internal messaging between users and admin
const Chat = {
    currentUser: null,
    messages: [],
    chatInterval: null,
    isModalOpen: false,

    render() {
        // Render as modal instead of full page
        this.showModal();
    },

    showModal() {
        if (this.isModalOpen) return;
        this.isModalOpen = true;
        
        const user = Auth.getCurrentUser();
        if (!user) {
            Components.toast('Silakan login terlebih dahulu', 'warning');
            return;
        }
        
        this.currentUser = user;
        this.loadMessages();
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'chatModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:end;justify-content:end;padding:16px;';
        modal.onclick = (e) => {
            if (e.target === modal) this.closeModal();
        };
        
        modal.innerHTML = `
            <div style="background:white;border-radius:16px;width:100%;max-width:400px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                <div style="padding:16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
                    <h3 style="margin:0;font-size:16px;">💬 Chat Admin</h3>
                    <button onclick="Chat.closeModal()" style="border:none;background:none;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <div id="chatMessages" style="flex:1;overflow-y:auto;padding:16px;background:#f9f9f9;min-height:300px;">
                    ${this.renderMessages()}
                </div>
                <div style="padding:16px;border-top:1px solid #eee;display:flex;gap:8px;">
                    <input type="text" id="chatInput" class="form-input" placeholder="Ketik pesan..." style="flex:1;" onkeypress="if(event.key==='Enter')Chat.sendMessage()">
                    <button class="btn btn-primary" onclick="Chat.sendMessage()">Kirim</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    closeModal() {
        this.isModalOpen = false;
        const modal = document.getElementById('chatModal');
        if (modal) modal.remove();
        // Reset to dashboard
        window.location.hash = '';
    },

    renderMessages() {
        if (this.messages.length === 0) {
            return '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Belum ada pesan. Mulai percakapan!</p>';
        }
        
        return this.messages.map(msg => {
            const isMe = msg.sender_id === this.currentUser?.id || msg.sender_name === this.currentUser?.name;
            const time = new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const align = isMe ? 'flex-end' : 'flex-start';
            const bg = isMe ? 'var(--primary)' : 'var(--bg-primary)';
            const color = isMe ? 'white' : 'var(--text-primary)';
            
            return `
                <div style="display: flex; justify-content: ${align}; margin-bottom: 12px;">
                    <div style="max-width: 75%; padding: 12px; border-radius: 12px; background: ${bg}; color: ${color};">
                        ${!isMe ? `<div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">${msg.sender_name}</div>` : ''}
                        <div>${msg.message}</div>
                        <div style="font-size: 10px; opacity: 0.7; margin-top: 4px; text-align: right;">${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    async afterRender() {
        // For modal, we don't need afterRender since it's handled in showModal
    },

    async loadMessages() {
        try {
            const config = StorageService.getDatabaseConfig();
            if (!config.url || !config.anonKey || StorageService.getMode() !== 'database') {
                // Fallback to local storage
                this.messages = await StorageService.getJSON('chatMessages', []);
                this.updateChatUI();
                return;
            }

            const client = supabase.createClient(config.url, config.anonKey);
            const { data, error } = await client
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50);

            if (error && error.code !== 'PGRST116') {
                console.error('Error loading messages:', error);
                this.messages = await StorageService.getJSON('chatMessages', []);
            } else {
                this.messages = data || [];
                // Also save to local
                await StorageService.setJSON('chatMessages', this.messages);
            }
            
            this.updateChatUI();
            this.checkAdminStatus();
        } catch (error) {
            console.error('Failed to load messages:', error);
            this.messages = await StorageService.getJSON('chatMessages', []);
            this.updateChatUI();
        }
    },

    updateChatUI() {
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer) {
            chatContainer.innerHTML = this.renderMessages();
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    },

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        const newMessage = {
            id: Date.now().toString(),
            sender_id: this.currentUser?.id || 'user_' + Date.now(),
            sender_name: this.currentUser?.name || 'User',
            message: message,
            is_admin: this.currentUser?.role === 'admin',
            created_at: new Date().toISOString(),
            read: false
        };

        // Add to local list immediately
        this.messages.push(newMessage);
        this.updateChatUI();
        input.value = '';

        try {
            const config = StorageService.getDatabaseConfig();
            if (config.url && config.anonKey && StorageService.getMode() === 'database') {
                const client = supabase.createClient(config.url, config.anonKey);
                await client.from('chat_messages').insert(newMessage);
            }
            
            // Also save locally
            await StorageService.setJSON('chatMessages', this.messages);
            
            // Update online status
            this.updateOnlineStatus();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    },

    async updateOnlineStatus() {
        try {
            const config = StorageService.getDatabaseConfig();
            if (!config.url || !config.anonKey || StorageService.getMode() !== 'database') return;

            const client = supabase.createClient(config.url, config.anonKey);
            
            // Upsert current user status
            await client.from('user_status').upsert({
                user_id: this.currentUser?.id || 'user_' + Date.now(),
                user_name: this.currentUser?.name || 'User',
                is_online: true,
                last_seen: new Date().toISOString(),
                is_admin: this.currentUser?.role === 'admin'
            }, { onConflict: 'user_id' });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    },

    async checkAdminStatus() {
        try {
            const config = StorageService.getDatabaseConfig();
            if (!config.url || !config.anonKey || StorageService.getMode() !== 'database') return;

            const client = supabase.createClient(config.url, config.anonKey);
            
            // Check for admin status
            const { data } = await client
                .from('user_status')
                .select('*')
                .eq('is_admin', true)
                .single();

            const adminStatusEl = document.getElementById('adminStatus');
            if (adminStatusEl) {
                if (data && data.is_online) {
                    adminStatusEl.innerHTML = '● Online';
                    adminStatusEl.style.color = 'var(--success)';
                } else {
                    adminStatusEl.innerHTML = '● Offline';
                    adminStatusEl.style.color = 'var(--text-secondary)';
                }
            }
        } catch (error) {
            // Admin likely offline
            const adminStatusEl = document.getElementById('adminStatus');
            if (adminStatusEl) {
                adminStatusEl.innerHTML = '● Offline';
                adminStatusEl.style.color = 'var(--text-secondary)';
            }
        }
    },

    startAutoRefresh() {
        // Refresh messages every 10 seconds
        if (this.chatInterval) clearInterval(this.chatInterval);
        this.chatInterval = setInterval(() => {
            this.loadMessages();
        }, 10000);
        
        // Update online status
        this.updateOnlineStatus();
    },

    destroy() {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
        }
    }
};

// Make Chat globally available
window.Chat = Chat;
