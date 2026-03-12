// ============================================
// Church Admin - Storage Adapter
// ============================================

// Import Supabase Client (assuming it's loaded globally or via a script tag)
// For local development, you might add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

class LocalStorageAdapter {
    getItem(key) {
        return localStorage.getItem(key);
    }

    setItem(key, value) {
        localStorage.setItem(key, value);
    }

    removeItem(key) {
        localStorage.removeItem(key);
    }
}

class DatabaseAdapter {
    constructor(config = {}) {
        console.log('=== DatabaseAdapter Constructor ===');
        console.log('Config:', config);
        this.config = config;
        this.supabase = null;
        this.initializeSupabase();
    }

    initializeSupabase() {
        if (!this.config.url || !this.config.anonKey) {
            console.warn('Supabase URL atau Anon Key tidak tersedia. Menggunakan fallback localStorage.');
            return;
        }
        if (typeof supabase === 'undefined') {
            console.error('Supabase client library tidak ditemukan. Pastikan <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> dimuat.');
            return;
        }
        try {
            this.supabase = supabase.createClient(this.config.url, this.config.anonKey);
            console.log('Supabase client diinisialisasi.', this.config.url);
        } catch (error) {
            console.error('Gagal menginisialisasi Supabase client:', error.message);
            this.supabase = null;
        }
    }

    async getItem(key) {
        // In database mode, always try Supabase first, skip localStorage
        if (this.supabase && this.config && this.config.table) {
            try {
                console.log('Getting from Supabase for key:', key);
                const { data, error } = await this.supabase
                    .from(this.config.table)
                    .select('payload')
                    .eq('id', key)
                    .single();
                
                if (data && data.payload) {
                    console.log('Got data from Supabase for key:', key);
                    return JSON.stringify(data.payload);
                }
            } catch (e) {
                console.warn('Failed to get from Supabase:', e.message);
            }
        }
        // Fallback to localStorage only if Supabase fails or not configured
        const localData = localStorage.getItem(key);
        return localData || null;
    }

    async setItem(key, value) {
        // Always save to localStorage first
        localStorage.setItem(key, value);
        console.log('Saving to localStorage:', key);
        
        // Then sync to Supabase immediately
        console.log('Supabase config:', this.supabase ? 'exists' : 'null', 'table:', this.config?.table);
        if (!this.supabase || !this.config.table) {
            console.log('Skipping Supabase sync - not configured');
            return;
        }
        
        // Force push to Supabase immediately
        console.log('Pushing to Supabase immediately...');
        try {
            // Call StorageService method, not this adapter's method
            await StorageService.pushLocalDataToDatabase(key);
            console.log('Pushed to Supabase successfully');
        } catch (e) {
            console.error('Failed to push to Supabase:', e.message);
        }
    }

    async removeItem(key) {
        if (!this.supabase || !this.config.table) {
            // Fallback to localStorage if Supabase is not ready
            localStorage.removeItem(key);
            return;
        }
        try {
            const { error } = await this.supabase
                .from(this.config.table)
                .delete()
                .eq('id', key);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Gagal menghapus item '${key}' dari Supabase:`, error.message);
            // Fallback to localStorage on error
            localStorage.removeItem(key);
        }
    }
}

const StorageService = {
    adapter: null,
    modeKey: 'storageMode',
    configKey: 'databaseConfig',
    autoSyncKey: 'storageAutoSync',
    autoPullKey: 'storageAutoPull',
    autoPullIntervalKey: 'storageAutoPullIntervalSec',
    sharedConfigId: 'churchAdminStorageSettings',
    syncMetaKey: 'storageSyncMeta',
    defaultMode: 'local',
    syncTimer: null,
    syncInProgress: false,
    availableModes: {
        local: LocalStorageAdapter,
        database: DatabaseAdapter
    },

    getMode() {
        const mode = localStorage.getItem(this.modeKey) || this.defaultMode;
        // Auto-enable database mode if Supabase config is available
        if (mode === 'local' && this.isDatabaseConfigReady()) {
            console.log('[StorageService] Auto-enabling database mode');
            this.setMode('database');
            return 'database';
        }
        return mode;
    },

    setMode(mode) {
        if (!this.availableModes[mode]) return false;
        localStorage.setItem(this.modeKey, mode);
        this.adapter = null;
        return true;
    },

    getDatabaseConfig() {
        const raw = localStorage.getItem(this.configKey);
        // Default Supabase config for GerejaKu
        const defaultConfig = {
            provider: 'supabase',
            url: 'https://vkshfbbwiejfcwiuobdn.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrc2hmYmJ3aWVqZmN3aXVvYmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTA0NDUsImV4cCI6MjA4ODYyNjQ0NX0.yjuIhKiE6gM63nTjbnyeiv1JL0doV6mYVTlxXTXOt94',
            table: 'app_storage'
        };
        // Also enable auto-pull by default
        if (!localStorage.getItem(this.autoPullKey)) {
            this.setAutoPullEnabled(true);
        }
        if (!localStorage.getItem(this.autoSyncKey)) {
            this.setAutoSyncEnabled(true);
        }
        if (!raw) {
            return defaultConfig;
        }
        try {
            const parsed = JSON.parse(raw);
            // If saved config doesn't have valid anonKey, use default
            // Valid JWT should start with 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
            const isValidJWT = parsed.anonKey && parsed.anonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
            const isValidURL = parsed.url && parsed.url.includes('.supabase.co');
            if (!isValidJWT || !isValidURL) {
                console.log('Invalid config detected, using default');
                return defaultConfig;
            }
            return {
                provider: 'supabase',
                table: 'app_storage',
                ...parsed
            };
        } catch (error) {
            return defaultConfig;
        }
    },

    setDatabaseConfig(config) {
        const current = this.getDatabaseConfig();
        const next = {
            ...current,
            ...config
        };
        localStorage.setItem(this.configKey, JSON.stringify(next));
        this.adapter = null; // Re-create adapter with new config
        return next;
    },

    isAutoSyncEnabled() {
        return localStorage.getItem(this.autoSyncKey) === 'true';
    },

    setAutoSyncEnabled(enabled) {
        localStorage.setItem(this.autoSyncKey, enabled ? 'true' : 'false');
    },

    isAutoPullEnabled() {
        return localStorage.getItem(this.autoPullKey) === 'true';
    },

    setAutoPullEnabled(enabled) {
        localStorage.setItem(this.autoPullKey, enabled ? 'true' : 'false');
    },

    getAutoPullIntervalSec() {
        const raw = localStorage.getItem(this.autoPullIntervalKey);
        const num = parseInt(raw || '45', 10);
        if (Number.isNaN(num) || num < 10) return 45;
        return num;
    },

    setAutoPullIntervalSec(seconds) {
        const num = parseInt(String(seconds), 10);
        const safeValue = Number.isNaN(num) || num < 10 ? 45 : num;
        localStorage.setItem(this.autoPullIntervalKey, String(safeValue));
        return safeValue;
    },

    getSyncMeta() {
        const raw = localStorage.getItem(this.syncMetaKey);
        const base = {
            dirty: false,
            lastLocalChangeAt: '',
            lastPushAt: '',
            lastPullAt: '',
            lastRemoteUpdatedAt: '',
            lastError: ''
        };
        if (!raw) return base;
        try {
            return { ...base, ...JSON.parse(raw) };
        } catch (error) {
            return base;
        }
    },

    setSyncMeta(nextMeta) {
        const merged = {
            ...this.getSyncMeta(),
            ...nextMeta
        };
        localStorage.setItem(this.syncMetaKey, JSON.stringify(merged));
        return merged;
    },

    markLocalChange() {
        this.setSyncMeta({
            dirty: true,
            lastLocalChangeAt: new Date().toISOString()
        });
    },

    markPushSuccess() {
        this.setSyncMeta({
            dirty: false,
            lastPushAt: new Date().toISOString(),
            lastError: ''
        });
    },

    markPullSuccess(remoteUpdatedAt = '') {
        this.setSyncMeta({
            dirty: false,
            lastPullAt: new Date().toISOString(),
            lastRemoteUpdatedAt: remoteUpdatedAt || this.getSyncMeta().lastRemoteUpdatedAt || '',
            lastError: ''
        });
    },

    markSyncError(message) {
        this.setSyncMeta({
            lastError: message || 'Unknown sync error'
        });
    },

    createAdapter() {
        const mode = this.getMode();
        console.log('=== createAdapter ===');
        console.log('Mode:', mode);
        const AdapterClass = this.availableModes[mode] || LocalStorageAdapter;
        try {
            if (mode === 'database') {
                const config = this.getDatabaseConfig();
                console.log('Creating DatabaseAdapter with config:', config);
                return new AdapterClass(config);
            }
            return new AdapterClass();
        } catch (error) {
            // Safety fallback: never block app startup in dev.
            console.error('Gagal membuat adapter. Menggunakan LocalStorageAdapter:', error.message);
            return new LocalStorageAdapter();
        }
    },

    init() {
        console.log('=== StorageService.init ===');
        console.log('Current mode:', this.getMode());
        console.log('Current adapter:', this.adapter ? this.adapter.constructor.name : 'none');
        
        const currentConfig = this.getDatabaseConfig();
        const needsReinit = !this.adapter || 
            (this.adapter.config && (
                this.adapter.config.url !== currentConfig.url || 
                this.adapter.config.anonKey !== currentConfig.anonKey ||
                this.adapter.config.table !== currentConfig.table
            ));
        
        if (needsReinit) {
            console.log('Creating new adapter (config changed or no adapter)...');
            this.adapter = this.createAdapter();
        }
    },

    getSupabaseHeaders() {
        const config = this.getDatabaseConfig();
        const anonKey = config.anonKey || '';
        return {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
        };
    },

    getSupabaseBaseUrl() {
        const config = this.getDatabaseConfig();
        const baseUrl = (config.url || '').replace(/\/$/, '');
        const table = config.table || 'app_storage';
        return `${baseUrl}/rest/v1/${table}`;
    },

    isDatabaseConfigReady() {
        const config = this.getDatabaseConfig();
        return Boolean(config.url && config.anonKey && config.table);
    },

    async testDatabaseConnection() {
        if (!this.isDatabaseConfigReady()) {
            throw new Error('Konfigurasi database belum lengkap.');
        }
        // Attempt to select a non-existent row to test connection and table access
        // Supabase will return an error if table doesn't exist or connection fails
        const config = this.getDatabaseConfig();
        const client = supabase.createClient(config.url, config.anonKey);
        try {
            const { data, error } = await client
                .from(config.table)
                .select('id')
                .limit(1);

            if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for a test
                throw error;
            }
            return true;
        } catch (error) {
            throw new Error(`Gagal koneksi atau akses tabel ke Supabase: ${error.message}`);
        }
    },

    getSharedStoragePayload() {
        const dbConfig = this.getDatabaseConfig();
        return {
            mode: this.getMode(),
            autoSync: this.isAutoSyncEnabled(),
            autoPull: this.isAutoPullEnabled(),
            autoPullIntervalSec: this.getAutoPullIntervalSec(),
            provider: dbConfig.provider || 'supabase',
            table: dbConfig.table || 'app_storage'
        };
    },

    applySharedStoragePayload(payload = {}) {
        const nextMode = payload.mode === 'database' ? 'database' : 'local';
        this.setMode(nextMode);
        this.setAutoSyncEnabled(payload.autoSync === true);
        this.setAutoPullEnabled(payload.autoPull === true);
        this.setAutoPullIntervalSec(payload.autoPullIntervalSec || 45);

        const dbConfig = this.getDatabaseConfig();
        this.setDatabaseConfig({
            provider: payload.provider || dbConfig.provider || 'supabase',
            table: payload.table || dbConfig.table || 'app_storage'
        });
    },

    async pushSharedStorageSettings() {
        if (!this.isDatabaseConfigReady()) {
            throw new Error('Konfigurasi database belum lengkap.');
        }

        const payload = {
            id: this.sharedConfigId,
            payload: this.getSharedStoragePayload(),
            updated_at: new Date().toISOString()
        };

        const config = this.getDatabaseConfig();
        const client = supabase.createClient(config.url, config.anonKey);

        const { error } = await client
            .from(config.table)
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            throw new Error(error.message || 'Gagal menyimpan pengaturan shared.');
        }
        return true;
    },

    async pullSharedStorageSettings() {
        if (!this.isDatabaseConfigReady()) {
            throw new Error('Konfigurasi database belum lengkap.');
        }

        const config = this.getDatabaseConfig();
        const client = supabase.createClient(config.url, config.anonKey);

        const { data, error } = await client
            .from(config.table)
            .select('payload,updated_at')
            .eq('id', this.sharedConfigId)
            .single();

        if (error && error.code === 'PGRST116') { // No rows found
            return { found: false };
        } else if (error) {
            throw new Error(error.message || 'Gagal mengambil pengaturan shared.');
        }
        if (!data || !data.payload) {
            return { found: false };
        }

        this.applySharedStoragePayload(data.payload);
        return {
            found: true,
            payload: data.payload
        };
    },

    async autoApplySharedStorageSettings() {
        if (!this.isDatabaseConfigReady()) {
            return { applied: false, reason: 'db_not_ready' };
        }
        try {
            const result = await this.pullSharedStorageSettings();
            if (!result.found) return { applied: false, reason: 'not_found' };
            return { applied: true, reason: 'ok', payload: result.payload };
        } catch (error) {
            console.warn('[StorageService] Shared settings pull skipped:', error.message);
            return { applied: false, reason: 'error', message: error.message };
        }
    },

    async pushLocalDataToDatabase(storageKey = 'churchAdminData') {
        console.log('=== pushLocalDataToDatabase ===');
        console.log('StorageKey:', storageKey);
        
        if (!this.isDatabaseConfigReady()) {
            throw new Error('Konfigurasi database belum lengkap.');
        }
        const localData = await this.getJSON(storageKey, null);
        console.log('LocalData keys:', localData ? Object.keys(localData) : 'null');
        if (!localData) {
            throw new Error('Data lokal tidak ditemukan.');
        }

        const payload = {
            id: storageKey,
            payload: localData,
            updated_at: new Date().toISOString()
        };
        console.log('Pushing payload with keys:', Object.keys(localData));

        const config = this.getDatabaseConfig();
        console.log('Config table:', config.table);
        const client = supabase.createClient(config.url, config.anonKey);

        const { data, error } = await client
            .from(config.table)
            .upsert(payload, { onConflict: 'id' })
            .select();

        console.log('Push result - data:', data, 'error:', error);
        
        if (error) {
            this.markSyncError(error.message || 'Push data ke database gagal.');
            throw new Error(error.message || 'Push data ke database gagal.');
        }
        this.markPushSuccess();
        return true;
    },

    async pullDatabaseDataToLocal(storageKey = 'churchAdminData', options = {}) {
        const force = options.force === true;
        if (!this.isDatabaseConfigReady()) {
            throw new Error('Konfigurasi database belum lengkap.');
        }
        
        console.log('[StorageService] Pulling from Supabase, force:', force);

        const config = this.getDatabaseConfig();
        const client = supabase.createClient(config.url, config.anonKey);

        const { data, error } = await client
            .from(config.table)
            .select('payload,updated_at')
            .eq('id', storageKey)
            .single();

        if (error && error.code === 'PGRST116') { // No rows found
            throw new Error('Data tidak ditemukan di database.');
        } else if (error) {
            this.markSyncError(error.message || 'Pull data dari database gagal.');
            throw new Error(error.message || 'Pull data dari database gagal.');
        }
        if (!data || !data.payload) {
            throw new Error('Data tidak ditemukan di database.');
        }

        const row = data;
        
        // Always save to localStorage when pulling from Supabase
        console.log('[StorageService] Saving pulled data to localStorage');
        await this.setJSON(storageKey, row.payload);
        this.markPullSuccess(row.updated_at);
        return { row, changed: true };
    },

    queueAutoPush(storageKey = 'churchAdminData', delayMs = 1200) {
        console.log('=== queueAutoPush ===');
        console.log('Mode:', this.getMode());
        console.log('AutoSync enabled:', this.isAutoSyncEnabled());
        console.log('Config ready:', this.isDatabaseConfigReady());
        
        if (this.getMode() !== 'database' || !this.isAutoSyncEnabled() || !this.isDatabaseConfigReady()) {
            console.log('AutoPush skipped - conditions not met');
            return;
        }
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        this.syncTimer = setTimeout(async () => {
            this.syncTimer = null;
            await this.performAutoPush(storageKey);
        }, delayMs);
    },

    async performAutoPush(storageKey = 'churchAdminData') {
        if (this.syncInProgress) return;
        this.syncInProgress = true;
        try {
            await this.pushLocalDataToDatabase(storageKey);
        } catch (error) {
            this.markSyncError(error.message);
            console.warn('[StorageService] Auto push failed:', error.message);
        } finally {
            this.syncInProgress = false;
        }
    },

    async autoPullOnStartup(storageKey = 'churchAdminData') {
        // Always pull from Supabase, don't check localStorage
        if (this.getMode() !== 'database' || !this.isAutoPullEnabled() || !this.isDatabaseConfigReady()) {
            return { pulled: false, reason: 'disabled' };
        }
        
        // Always pull from Supabase - don't skip if local data exists
        console.log('[StorageService] Auto pulling from Supabase...');
        
        if (this.getSyncMeta().dirty) {
            return { pulled: false, reason: 'local_dirty' };
        }
        try {
            const result = await this.pullDatabaseDataToLocal(storageKey, { force: true });
            return { pulled: true, changed: result.changed, reason: 'ok' };
        } catch (error) {
            this.markSyncError(error.message);
            console.warn('[StorageService] Auto pull skipped:', error.message);
            return { pulled: false, reason: 'error', message: error.message };
        }
    },

    // Sync to Supabase immediately
    async syncToSupabase(key, value) {
        console.log('=== SYNC DEBUG ===');
        console.log('Key:', key);
        console.log('Value type:', typeof value);
        console.log('Supabase exists:', !!this.supabase);
        console.log('Table:', this.config?.table);
        
        if (!this.supabase || !this.config.table) {
            console.log('Sync aborted: missing config');
            return;
        }
        
        try {
            const payload = {
                id: key,
                payload: JSON.parse(value),
                updated_at: new Date().toISOString()
            };
            console.log('Upserting payload:', payload);
            
            const { data, error } = await this.supabase
                .from(this.config.table)
                .upsert(payload, { onConflict: 'id' })
                .select();
            
            if (error) {
                console.error('Sync failed:', error.message);
                console.error('Full error:', error);
            } else {
                console.log('Sync to Supabase successful');
                console.log('Returned data:', data);
            }
        } catch (error) {
            console.error('Sync error:', error.message);
        }
    },

    // Fire and forget sync to Supabase
    queueSync(key, value) {
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        this.syncTimer = setTimeout(async () => {
            this.syncTimer = null;
            await this.syncToSupabase(key, value);
        }, 1500); // Wait 1.5 seconds after last change
    },

    setAdapter(adapter) {
        this.adapter = adapter;
    },

    // Fixed async methods with proper error handling
    async has(key) {
        try {
            this.init();
            const value = await this.adapter.getItem(key);
            return value !== null;
        } catch (error) {
            console.error(`Gagal mengecek key '${key}':`, error.message);
            return false;
        }
    },

    async getJSON(key, fallback = null) {
        try {
            this.init();
            const raw = await this.adapter.getItem(key);
            if (!raw) return fallback;
            try {
                return JSON.parse(raw);
            } catch (error) {
                console.error(`Gagal parsing JSON untuk key '${key}':`, error.message);
                return fallback;
            }
        } catch (error) {
            console.error(`Gagal mengambil key '${key}':`, error.message);
            return fallback;
        }
    },

    async setJSON(key, value) {
        console.log('=== StorageService.setJSON ===');
        console.log('Key:', key);
        console.log('Value preview:', JSON.stringify(value).substring(0, 100));
        console.log('Adapter:', this.adapter ? this.adapter.constructor.name : 'null');
        try {
            this.init();
            console.log('Adapter after init:', this.adapter ? this.adapter.constructor.name : 'null');
            await this.adapter.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Gagal menyimpan key '${key}':`, error.message);
            throw error;
        }
    },

    async remove(key) {
        try {
            this.init();
            await this.adapter.removeItem(key);
        } catch (error) {
            console.error(`Gagal menghapus key '${key}':`, error.message);
            throw error;
        }
    }
};

// Initialize storage service on load
document.addEventListener('DOMContentLoaded', () => {
    StorageService.init();
});
