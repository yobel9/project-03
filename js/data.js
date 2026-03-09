// ============================================
// Church Admin - Data Management
// ============================================

const AppData = {
    // Initialize data from localStorage or use defaults
    init() {
        if (!localStorage.getItem('churchAdminData')) {
            const defaultData = this.getDefaultData();
            localStorage.setItem('churchAdminData', JSON.stringify(defaultData));
        }
        const data = this.getData();

        // Schema migration for older saved data
        if (!Array.isArray(data.expenses)) {
            data.expenses = [];
            this.saveData(data);
        }
        if (!Array.isArray(data.structure)) {
            data.structure = this.getDefaultStructure();
            this.saveData(data);
        }
        if (Array.isArray(data.structure)) {
            let hasStructureUpdate = false;
            data.structure = data.structure.map((item) => {
                if (item && typeof item === 'object' && item.periodeJabatan === undefined) {
                    hasStructureUpdate = true;
                    return { ...item, periodeJabatan: '' };
                }
                return item;
            });
            if (hasStructureUpdate) {
                this.saveData(data);
            }
        }
        if (!Array.isArray(data.worshipSchedules)) {
            data.worshipSchedules = this.getDefaultWorshipSchedules();
            this.saveData(data);
        }
        if (Array.isArray(data.worshipSchedules)) {
            let hasWorshipUpdate = false;
            data.worshipSchedules = data.worshipSchedules.map((item) => {
                if (item && typeof item === 'object' && item.serviceDetails === undefined) {
                    hasWorshipUpdate = true;
                    return { ...item, serviceDetails: '' };
                }
                return item;
            });
            if (hasWorshipUpdate) {
                this.saveData(data);
            }
        }
        if (Array.isArray(data.events)) {
            let hasEventUpdate = false;
            data.events = data.events.map((item) => {
                if (item && typeof item === 'object' && item.priority === undefined) {
                    hasEventUpdate = true;
                    return { ...item, priority: 'normal' };
                }
                return item;
            });
            if (hasEventUpdate) {
                this.saveData(data);
            }
        }
        if (!Array.isArray(data.churchAnnouncements)) {
            data.churchAnnouncements = this.getDefaultChurchAnnouncements();
            this.saveData(data);
        }
        if (Array.isArray(data.churchAnnouncements)) {
            let hasAnnouncementUpdate = false;
            data.churchAnnouncements = data.churchAnnouncements.map((item) => {
                if (!item || typeof item !== 'object') return item;

                let nextItem = item;
                if (item.status === undefined) {
                    hasAnnouncementUpdate = true;
                    nextItem = { ...nextItem, status: 'draft' };
                }
                if (nextItem.type === 'service') {
                    hasAnnouncementUpdate = true;
                    nextItem = { ...nextItem, type: 'general' };
                }
                if (nextItem.type === 'youth' || nextItem.type === 'family') {
                    hasAnnouncementUpdate = true;
                    nextItem = { ...nextItem, type: 'other' };
                }
                return nextItem;
            });
            if (hasAnnouncementUpdate) {
                this.saveData(data);
            }
        }

        return data;
    },

    // Get all data from localStorage
    getData() {
        const data = localStorage.getItem('churchAdminData');
        return data ? JSON.parse(data) : this.getDefaultData();
    },

    // Save data to localStorage
    saveData(data) {
        localStorage.setItem('churchAdminData', JSON.stringify(data));
    },

    // Get default/sample data
    getDefaultData() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        return {
            members: [
                {
                    id: '1',
                    name: 'John Doe',
                    gender: 'Male',
                    birthDate: '1985-03-15',
                    birthPlace: 'Jakarta',
                    phone: '081234567890',
                    email: 'john.doe@email.com',
                    address: 'Jl. Merdeka No. 10',
                    city: 'Jakarta Pusat',
                    postalCode: '10110',
                    joinDate: '2020-01-15',
                    status: 'active',
                    photo: null,
                    notes: 'Active member of worship team'
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    gender: 'Female',
                    birthDate: '1990-07-22',
                    birthPlace: 'Bandung',
                    phone: '081234567891',
                    email: 'jane.smith@email.com',
                    address: 'Jl. Asia Afrika No. 25',
                    city: 'Bandung',
                    postalCode: '40111',
                    joinDate: '2019-06-20',
                    status: 'active',
                    photo: null,
                    notes: 'Sunday school teacher'
                },
                {
                    id: '3',
                    name: 'Michael Chen',
                    gender: 'Male',
                    birthDate: '1978-11-08',
                    birthPlace: 'Surabaya',
                    phone: '081234567892',
                    email: 'michael.chen@email.com',
                    address: 'Jl. Diponegoro No. 45',
                    city: 'Surabaya',
                    postalCode: '60241',
                    joinDate: '2018-03-10',
                    status: 'active',
                    photo: null,
                    notes: 'Elder'
                },
                {
                    id: '4',
                    name: 'Sarah Williams',
                    gender: 'Female',
                    birthDate: '1995-02-14',
                    birthPlace: 'Medan',
                    phone: '081234567893',
                    email: 'sarah.w@email.com',
                    address: 'Jl. Sisingamangaraja No. 8',
                    city: 'Medan',
                    postalCode: '20143',
                    joinDate: '2021-09-01',
                    status: 'active',
                    photo: null,
                    notes: 'Youth leader'
                },
                {
                    id: '5',
                    name: 'Robert Anderson',
                    gender: 'Male',
                    birthDate: '1982-09-30',
                    birthPlace: 'Semarang',
                    phone: '081234567894',
                    email: 'robert.a@email.com',
                    address: 'Jl. Ahmad Yani No. 120',
                    city: 'Semarang',
                    postalCode: '50231',
                    joinDate: '2017-05-15',
                    status: 'inactive',
                    photo: null,
                    notes: 'Moved to another city'
                },
                {
                    id: '6',
                    name: 'Maria Garcia',
                    gender: 'Female',
                    birthDate: '1988-12-25',
                    birthPlace: 'Makassar',
                    phone: '081234567895',
                    email: 'maria.g@email.com',
                    address: 'Jl. Jason No. 33',
                    city: 'Makassar',
                    postalCode: '90141',
                    joinDate: '2022-02-14',
                    status: 'active',
                    photo: null,
                    notes: ''
                },
                {
                    id: '7',
                    name: 'David Lee',
                    gender: 'Male',
                    birthDate: '1992-06-18',
                    birthPlace: 'Denpasar',
                    phone: '081234567896',
                    email: 'david.lee@email.com',
                    address: 'Jl. Sunset Road No. 88',
                    city: 'Denpasar',
                    postalCode: '80361',
                    joinDate: '2021-11-25',
                    status: 'active',
                    photo: null,
                    notes: 'Sound system technician'
                },
                {
                    id: '8',
                    name: 'Lisa Tan',
                    gender: 'Female',
                    birthDate: '1993-04-05',
                    birthPlace: 'Manado',
                    phone: '081234567897',
                    email: 'lisa.tan@email.com',
                    address: 'Jl. Sam Ratulangi No. 12',
                    city: 'Manado',
                    postalCode: '95112',
                    joinDate: '2023-01-10',
                    status: 'active',
                    photo: null,
                    notes: 'New member'
                }
            ],
            attendance: [
                {
                    id: '1',
                    date: this.getWeekStart(now),
                    service: 'Sunday Service',
                    presentMembers: ['1', '2', '3', '4', '6', '7']
                },
                {
                    id: '2',
                    date: this.getWeekStart(new Date(now - 7 * 24 * 60 * 60 * 1000)),
                    service: 'Sunday Service',
                    presentMembers: ['1', '2', '3', '4', '5', '6', '7', '8']
                },
                {
                    id: '3',
                    date: this.getWeekStart(new Date(now - 14 * 24 * 60 * 60 * 1000)),
                    service: 'Sunday Service',
                    presentMembers: ['1', '2', '3', '6', '7']
                },
                {
                    id: '4',
                    date: this.getWeekStart(new Date(now - 21 * 24 * 60 * 60 * 1000)),
                    service: 'Sunday Service',
                    presentMembers: ['1', '2', '4', '6', '7', '8']
                }
            ],
            donations: [
                {
                    id: '1',
                    date: '2026-03-01',
                    donorName: 'John Doe',
                    amount: 500000,
                    category: 'tithe',
                    paymentMethod: 'Cash',
                    notes: 'Weekly tithe'
                },
                {
                    id: '2',
                    date: '2026-03-01',
                    donorName: 'Jane Smith',
                    amount: 300000,
                    category: 'tithe',
                    paymentMethod: 'Transfer',
                    notes: 'Weekly tithe'
                },
                {
                    id: '3',
                    date: '2026-03-01',
                    donorName: 'Michael Chen',
                    amount: 1000000,
                    category: 'building',
                    paymentMethod: 'Transfer',
                    notes: 'Building fund donation'
                },
                {
                    id: '4',
                    date: '2026-03-02',
                    donorName: 'Sarah Williams',
                    amount: 150000,
                    category: 'offering',
                    paymentMethod: 'Cash',
                    notes: 'Special offering'
                },
                {
                    id: '5',
                    date: '2026-02-24',
                    donorName: 'Robert Anderson',
                    amount: 400000,
                    category: 'tithe',
                    paymentMethod: 'Transfer',
                    notes: 'Weekly tithe'
                },
                {
                    id: '6',
                    date: '2026-02-24',
                    donorName: 'Maria Garcia',
                    amount: 250000,
                    category: 'tithe',
                    paymentMethod: 'Cash',
                    notes: 'Weekly tithe'
                },
                {
                    id: '7',
                    date: '2026-02-17',
                    donorName: 'David Lee',
                    amount: 200000,
                    category: 'tithe',
                    paymentMethod: 'Transfer',
                    notes: 'Weekly tithe'
                },
                {
                    id: '8',
                    date: '2026-02-17',
                    donorName: 'Lisa Tan',
                    amount: 100000,
                    category: 'offering',
                    paymentMethod: 'Cash',
                    notes: 'First donation'
                }
            ],
            expenses: [
                {
                    id: '1',
                    date: '2026-03-03',
                    partyName: 'Toko Listrik Berkah',
                    amount: 350000,
                    category: 'utility',
                    paymentMethod: 'Transfer',
                    notes: 'Pembayaran listrik gereja'
                },
                {
                    id: '2',
                    date: '2026-02-28',
                    partyName: 'CV Sinar Teknik',
                    amount: 500000,
                    category: 'maintenance',
                    paymentMethod: 'Transfer',
                    notes: 'Perbaikan sound system'
                }
            ],
            structure: this.getDefaultStructure(),
            worshipSchedules: this.getDefaultWorshipSchedules(),
            churchAnnouncements: this.getDefaultChurchAnnouncements(),
            events: [
                {
                    id: '1',
                    name: 'Sunday Service',
                    date: this.formatDate(now),
                    time: '07:00',
                    endTime: '09:00',
                    location: 'Main Hall',
                    category: 'service',
                    priority: 'high',
                    status: 'upcoming',
                    description: 'Weekly Sunday worship service',
                    attendees: ['1', '2', '3', '4', '6', '7']
                },
                {
                    id: '2',
                    name: 'Youth Fellowship',
                    date: this.formatDate(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)),
                    time: '18:00',
                    endTime: '20:00',
                    location: 'Youth Room',
                    category: 'fellowship',
                    priority: 'normal',
                    status: 'upcoming',
                    description: 'Weekly youth gathering',
                    attendees: ['4', '7', '8']
                },
                {
                    id: '3',
                    name: 'Worship Team Practice',
                    date: this.formatDate(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)),
                    time: '19:00',
                    endTime: '21:00',
                    location: 'Main Hall',
                    category: 'practice',
                    priority: 'low',
                    status: 'upcoming',
                    description: 'Weekly worship practice',
                    attendees: ['1', '2', '6']
                },
                {
                    id: '4',
                    name: 'Easter Celebration',
                    date: '2026-04-20',
                    time: '06:00',
                    endTime: '12:00',
                    location: 'Church Ground',
                    category: 'celebration',
                    priority: 'high',
                    status: 'upcoming',
                    description: 'Easter sunrise service and celebration',
                    attendees: []
                },
                {
                    id: '5',
                    name: 'Bible Study',
                    date: this.formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
                    time: '19:00',
                    endTime: '21:00',
                    location: 'Fellowship Hall',
                    category: 'study',
                    priority: 'normal',
                    status: 'completed',
                    description: 'Weekly Bible study session',
                    attendees: ['1', '3', '5']
                }
            ],
            activities: [
                {
                    id: '1',
                    type: 'member',
                    title: 'New member registered',
                    description: 'Lisa Tan joined as new member',
                    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    type: 'donation',
                    title: 'Donation received',
                    description: 'Michael Chen donated Rp 1,000,000 for building fund',
                    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    type: 'event',
                    title: 'Event scheduled',
                    description: 'Easter Celebration has been scheduled',
                    timestamp: now.toISOString()
                },
                {
                    id: '4',
                    type: 'member',
                    title: 'Member updated',
                    description: 'Sarah Williams profile has been updated',
                    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '5',
                    type: 'donation',
                    title: 'Donation received',
                    description: 'John Doe gave tithe Rp 500,000',
                    timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
    },

    getDefaultStructure() {
        return [
            { id: 's1', role: 'Gembala Sidang', name: 'Pdt. Andreas Simanjuntak', periodeJabatan: '2024-2028', phone: '0812-1111-2222', email: 'andreas@gerejaku.id', notes: '' },
            { id: 's2', role: 'Hamba Tuhan', name: 'Pdt. Maria Lestari', periodeJabatan: '2024-2028', phone: '0812-3333-4444', email: 'maria@gerejaku.id', notes: '' },
            { id: 's3', role: 'Ketua Majelis', name: 'Bpk. Yohanes Lim', periodeJabatan: '2025-2029', phone: '0812-5555-6666', email: 'yohanes@gerejaku.id', notes: '' },
            { id: 's4', role: 'Wakil Ketua Majelis', name: 'Bpk. Daniel Santoso', periodeJabatan: '2025-2029', phone: '0813-1234-5678', email: 'daniel@gerejaku.id', notes: '' },
            { id: 's5', role: 'Sekretaris', name: 'Ibu Deborah', periodeJabatan: '2025-2029', phone: '0812-7777-8888', email: 'deborah@gerejaku.id', notes: '' },
            { id: 's6', role: 'Bendahara', name: 'Ibu Ruth', periodeJabatan: '2025-2029', phone: '0812-8888-3434', email: 'ruth@gerejaku.id', notes: '' }
        ];
    },

    getDefaultWorshipSchedules() {
        return [
            { id: 'ws1', name: 'Ibadah Raya', category: 'routine', dayOfWeek: 'Sunday', date: '', startTime: '07:00', endTime: '09:00', location: 'Gedung Gereja', recurrenceNote: '', invitationNote: '', serviceDetails: '', notes: '' },
            { id: 'ws2', name: 'Sekolah Minggu', category: 'routine', dayOfWeek: 'Sunday', date: '', startTime: '09:30', endTime: '10:45', location: 'Ruang Sekolah Minggu', recurrenceNote: '', invitationNote: '', serviceDetails: '', notes: '' },
            { id: 'ws3', name: 'Ibadah Pemuda Remaja', category: 'routine', dayOfWeek: 'Friday', date: '', startTime: '18:30', endTime: '20:00', location: 'Aula Pemuda', recurrenceNote: '', invitationNote: '', serviceDetails: '', notes: '' },
            { id: 'ws4', name: 'Ibadah Rumah Tangga', category: 'flexible', dayOfWeek: '', date: '', startTime: '19:00', endTime: '20:30', location: 'Rumah Jemaat', recurrenceNote: 'Jadwal fleksibel, ditentukan per wilayah.', invitationNote: '', serviceDetails: '', notes: '' }
        ];
    },

    getDefaultChurchAnnouncements() {
        return [
            {
                id: 'ca1',
                title: 'Doa Puasa Bersama',
                date: '2026-03-15',
                type: 'general',
                status: 'published',
                content: 'Seluruh jemaat diundang mengikuti doa puasa bersama di gedung gereja pukul 18.00 WITA.'
            },
            {
                id: 'ca2',
                title: 'Pendaftaran Baptisan',
                date: '2026-03-20',
                type: 'general',
                status: 'draft',
                content: 'Pendaftaran kelas katekisasi dan baptisan dibuka sampai tanggal 5 April 2026.'
            }
        ];
    },

    // Helper function to get week start (Sunday)
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const weekStart = new Date(d.setDate(diff));
        return weekStart.toISOString().split('T')[0];
    },

    // Format date to YYYY-MM-DD
    formatDate(date) {
        return date.toISOString().split('T')[0];
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Get members
    getMembers() {
        return this.getData().members;
    },

    // Add member
    addMember(member) {
        const data = this.getData();
        member.id = this.generateId();
        data.members.push(member);
        this.saveData(data);
        this.addActivity('member', 'New member registered', `${member.name} joined as new member`);
        return member;
    },

    // Update member
    updateMember(id, updates) {
        const data = this.getData();
        const index = data.members.findIndex(m => m.id === id);
        if (index !== -1) {
            data.members[index] = { ...data.members[index], ...updates };
            this.saveData(data);
            this.addActivity('member', 'Member updated', `${data.members[index].name} profile has been updated`);
            return data.members[index];
        }
        return null;
    },

    // Delete member
    deleteMember(id) {
        const data = this.getData();
        const member = data.members.find(m => m.id === id);
        data.members = data.members.filter(m => m.id !== id);
        this.saveData(data);
        return member;
    },

    // Get attendance records
    getAttendance() {
        return this.getData().attendance;
    },

    // Add attendance record
    addAttendance(record) {
        const data = this.getData();
        record.id = this.generateId();
        data.attendance.push(record);
        this.saveData(data);
        return record;
    },

    // Get donations
    getDonations() {
        return this.getData().donations;
    },

    // Add donation
    addDonation(donation) {
        const data = this.getData();
        donation.id = this.generateId();
        donation.amount = parseInt(donation.amount);
        data.donations.push(donation);
        this.saveData(data);
        
        const categoryNames = {
            tithe: 'tithe',
            offering: 'offering',
            building: 'building fund',
            special: 'special donation',
            other: 'donation'
        };
        
        this.addActivity('donation', 'Donation received', `${donation.donorName} gave ${categoryNames[donation.category] || 'donation'} Rp ${this.formatCurrency(donation.amount)}`);
        return donation;
    },

    // Update donation
    updateDonation(id, updates) {
        const data = this.getData();
        const index = data.donations.findIndex(d => d.id === id);
        if (index !== -1) {
            data.donations[index] = {
                ...data.donations[index],
                ...updates,
                amount: updates.amount !== undefined ? parseInt(updates.amount) : data.donations[index].amount
            };
            this.saveData(data);
            return data.donations[index];
        }
        return null;
    },

    // Delete donation
    deleteDonation(id) {
        const data = this.getData();
        data.donations = data.donations.filter(d => d.id !== id);
        this.saveData(data);
    },

    // Get expenses
    getExpenses() {
        return this.getData().expenses || [];
    },

    // Add expense
    addExpense(expense) {
        const data = this.getData();
        expense.id = this.generateId();
        expense.amount = parseInt(expense.amount);
        data.expenses = data.expenses || [];
        data.expenses.push(expense);
        this.saveData(data);
        this.addActivity('donation', 'Expense recorded', `${expense.partyName} expense Rp ${this.formatCurrency(expense.amount)}`);
        return expense;
    },

    // Update expense
    updateExpense(id, updates) {
        const data = this.getData();
        data.expenses = data.expenses || [];
        const index = data.expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            data.expenses[index] = {
                ...data.expenses[index],
                ...updates,
                amount: updates.amount !== undefined ? parseInt(updates.amount) : data.expenses[index].amount
            };
            this.saveData(data);
            return data.expenses[index];
        }
        return null;
    },

    // Delete expense
    deleteExpense(id) {
        const data = this.getData();
        data.expenses = (data.expenses || []).filter(e => e.id !== id);
        this.saveData(data);
    },

    // Structure (church board)
    getStructure() {
        return this.getData().structure || [];
    },

    addStructure(entry) {
        const data = this.getData();
        entry.id = this.generateId();
        entry.periodeJabatan = entry.periodeJabatan || '';
        data.structure = data.structure || [];
        data.structure.push(entry);
        this.saveData(data);
        this.addActivity('structure', 'Structure added', `${entry.role} - ${entry.name}`);
        return entry;
    },

    updateStructure(id, updates) {
        const data = this.getData();
        data.structure = data.structure || [];
        const idx = data.structure.findIndex(s => s.id === id);
        if (idx !== -1) {
            data.structure[idx] = { ...data.structure[idx], ...updates };
            this.saveData(data);
            return data.structure[idx];
        }
        return null;
    },

    deleteStructure(id) {
        const data = this.getData();
        data.structure = (data.structure || []).filter(s => s.id !== id);
        this.saveData(data);
    },

    // Worship schedules
    getWorshipSchedules() {
        return this.getData().worshipSchedules || [];
    },

    addWorshipSchedule(schedule) {
        const data = this.getData();
        schedule.id = this.generateId();
        data.worshipSchedules = data.worshipSchedules || [];
        data.worshipSchedules.push(schedule);
        this.saveData(data);
        this.addActivity('event', 'Jadwal ibadah ditambahkan', `${schedule.name}`);
        return schedule;
    },

    updateWorshipSchedule(id, updates) {
        const data = this.getData();
        data.worshipSchedules = data.worshipSchedules || [];
        const index = data.worshipSchedules.findIndex((item) => item.id === id);
        if (index !== -1) {
            data.worshipSchedules[index] = { ...data.worshipSchedules[index], ...updates };
            this.saveData(data);
            return data.worshipSchedules[index];
        }
        return null;
    },

    deleteWorshipSchedule(id) {
        const data = this.getData();
        data.worshipSchedules = (data.worshipSchedules || []).filter((item) => item.id !== id);
        this.saveData(data);
    },

    // Church announcements
    getChurchAnnouncements() {
        return this.getData().churchAnnouncements || [];
    },

    addChurchAnnouncement(announcement) {
        const data = this.getData();
        announcement.id = this.generateId();
        data.churchAnnouncements = data.churchAnnouncements || [];
        data.churchAnnouncements.push(announcement);
        this.saveData(data);
        this.addActivity('event', 'Pengumuman ditambahkan', announcement.title);
        return announcement;
    },

    updateChurchAnnouncement(id, updates) {
        const data = this.getData();
        data.churchAnnouncements = data.churchAnnouncements || [];
        const index = data.churchAnnouncements.findIndex((item) => item.id === id);
        if (index !== -1) {
            data.churchAnnouncements[index] = { ...data.churchAnnouncements[index], ...updates };
            this.saveData(data);
            return data.churchAnnouncements[index];
        }
        return null;
    },

    deleteChurchAnnouncement(id) {
        const data = this.getData();
        data.churchAnnouncements = (data.churchAnnouncements || []).filter((item) => item.id !== id);
        this.saveData(data);
    },

    // Get events
    getEvents() {
        return this.syncEventStatuses();
    },

    // Add event
    addEvent(event) {
        const data = this.getData();
        event.id = this.generateId();
        event.attendees = [];
        data.events.push(event);
        this.saveData(data);
        this.addActivity('event', 'Event scheduled', `${event.name} has been scheduled`);
        return event;
    },

    // Update event
    updateEvent(id, updates) {
        const data = this.getData();
        const index = data.events.findIndex(e => e.id === id);
        if (index !== -1) {
            data.events[index] = { ...data.events[index], ...updates };
            this.saveData(data);
            return data.events[index];
        }
        return null;
    },

    // Delete event
    deleteEvent(id) {
        const data = this.getData();
        data.events = data.events.filter(e => e.id !== id);
        this.saveData(data);
    },

    // Auto-sync event statuses based on event date and time
    syncEventStatuses() {
        const data = this.getData();
        const events = data.events || [];
        const now = new Date();
        let hasChanges = false;

        const parseEventDateTime = (dateStr, timeStr, fallbackTime = '00:00') => {
            if (!dateStr) return null;
            const time = (timeStr && timeStr.length >= 5) ? timeStr : fallbackTime;
            const dt = new Date(`${dateStr}T${time}:00`);
            return Number.isNaN(dt.getTime()) ? null : dt;
        };

        data.events = events.map((event) => {
            const startAt = parseEventDateTime(event.date, event.time, '00:00');
            const endAt = parseEventDateTime(event.date, event.endTime, event.time || '23:59');
            if (!startAt || !endAt) return event;

            let nextStatus = event.status;
            if (now < startAt) {
                nextStatus = 'upcoming';
            } else if (now > endAt) {
                nextStatus = 'completed';
            } else {
                nextStatus = 'ongoing';
            }

            if (nextStatus !== event.status) {
                hasChanges = true;
                return { ...event, status: nextStatus };
            }
            return event;
        });

        if (hasChanges) {
            this.saveData(data);
        }

        return data.events;
    },

    // Get activities
    getActivities() {
        return this.getData().activities;
    },

    // Add activity
    addActivity(type, title, description) {
        const data = this.getData();
        const activity = {
            id: this.generateId(),
            type,
            title,
            description,
            timestamp: new Date().toISOString()
        };
        data.activities.unshift(activity);
        // Keep only last 50 activities
        data.activities = data.activities.slice(0, 50);
        this.saveData(data);
        return activity;
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID').format(amount);
    },

    // Get stats for dashboard
    getStats() {
        const data = this.getData();
        const now = new Date();
        const thisMonth = now.toISOString().slice(0, 7);
        const thisWeek = this.getWeekStart(now);
        
        const totalMembers = data.members.filter(m => m.status === 'active').length;
        
        const newMembersThisMonth = data.members.filter(m => {
            return m.joinDate && m.joinDate.slice(0, 7) === thisMonth;
        }).length;
        
        const thisWeekAttendance = data.attendance.find(a => a.date === thisWeek);
        const attendanceCount = thisWeekAttendance ? thisWeekAttendance.presentMembers.length : 0;
        
        const donationsThisMonth = data.donations
            .filter(d => d.date.slice(0, 7) === thisMonth)
            .reduce((sum, d) => sum + d.amount, 0);
        
        return {
            totalMembers,
            newMembersThisMonth,
            attendanceCount,
            donationsThisMonth
        };
    }
};

// Initialize data on load
document.addEventListener('DOMContentLoaded', () => {
    AppData.init();
});
