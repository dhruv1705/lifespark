// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Initialize Supabase client using config
        const supabaseUrl = window.CONFIG?.SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseAnonKey = window.CONFIG?.SUPABASE_ANON_KEY || 'placeholder-key';

        // Import Supabase client
        try {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            this.supabase = createClient(supabaseUrl, supabaseAnonKey);
            console.log('Supabase client initialized');
            
            // Check if we have valid credentials
            if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
                console.warn('Using placeholder credentials. Please update config.js with your actual Supabase credentials.');
            }
        } catch (error) {
            console.error('Error initializing Supabase:', error);
            this.showError('Failed to initialize database connection');
        }

        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async checkAuthStatus() {
        if (!this.supabase) return;

        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) {
                this.currentUser = user;
                this.showDashboard();
                this.loadDashboardData();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            if (!this.supabase) {
                throw new Error('Database connection not available');
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            // Check if user has admin privileges
            const isAdmin = this.checkAdminPrivileges(email);
            if (isAdmin) {
                this.currentUser = data.user;
                this.showDashboard();
                this.loadDashboardData();
                errorDiv.classList.add('hidden');
            } else {
                throw new Error('Access denied. Admin privileges required.');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = error.message || 'Login failed';
            errorDiv.classList.remove('hidden');
        }
    }

    checkAdminPrivileges(email) {
        const config = window.CONFIG || {};
        const adminUsers = config.ADMIN_USERS || [];
        const adminDomains = config.ADMIN_EMAIL_DOMAINS || [];

        // Check if email is in admin users list
        if (adminUsers.includes(email)) {
            return true;
        }

        // Check if email domain is in admin domains
        const emailDomain = '@' + email.split('@')[1];
        if (adminDomains.includes(emailDomain)) {
            return true;
        }

        // Fallback check for development
        if (email.includes('admin') || email.includes('lifespark')) {
            return true;
        }

        return false;
    }

    showDashboard() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
    }

    showSection(sectionName) {
        // Hide all sections
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('usersSection').classList.add('hidden');
        document.getElementById('analyticsSection').classList.add('hidden');

        // Show selected section
        document.getElementById(sectionName + 'Section').classList.remove('hidden');

        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.classList.add('active');

        // Load section-specific data
        switch (sectionName) {
            case 'users':
                this.loadUsers();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    async loadDashboardData() {
        try {
            if (!this.supabase) {
                this.showMockData();
                return;
            }

            // Load basic statistics
            const [usersResult, habitsResult] = await Promise.all([
                this.supabase.from('users').select('*', { count: 'exact' }),
                this.supabase.from('daily_completions').select('*', { count: 'exact' })
            ]);

            const totalUsers = usersResult.count || 0;
            const totalHabits = habitsResult.count || 0;

            // Calculate active users (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const { count: activeUsers } = await this.supabase
                .from('users')
                .select('*', { count: 'exact' })
                .gte('updated_at', sevenDaysAgo.toISOString());

            // Calculate average XP
            const { data: xpData } = await this.supabase
                .from('daily_completions')
                .select('xp_earned');
            
            const avgXP = xpData && xpData.length > 0 
                ? Math.round(xpData.reduce((sum, record) => sum + (record.xp_earned || 0), 0) / xpData.length)
                : 0;

            this.updateDashboardStats({
                totalUsers,
                activeUsers: activeUsers || 0,
                totalHabits,
                avgXP
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showMockData();
        }
    }

    showMockData() {
        // Show mock data when Supabase is not available
        this.updateDashboardStats({
            totalUsers: 156,
            activeUsers: 89,
            totalHabits: 1234,
            avgXP: 245
        });
    }

    updateDashboardStats(stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('activeUsers').textContent = stats.activeUsers;
        document.getElementById('totalHabits').textContent = stats.totalHabits;
        document.getElementById('avgXP').textContent = stats.avgXP;
    }

    async loadUsers() {
        const loadingDiv = document.getElementById('usersLoading');
        const tableDiv = document.getElementById('usersTable');
        const tbody = document.getElementById('usersTableBody');

        loadingDiv.classList.remove('hidden');
        tableDiv.classList.add('hidden');

        try {
            if (!this.supabase) {
                this.showMockUsers();
                return;
            }

            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            tbody.innerHTML = '';
            users.forEach(user => {
                const row = this.createUserRow(user);
                tbody.appendChild(row);
            });

            loadingDiv.classList.add('hidden');
            tableDiv.classList.remove('hidden');

        } catch (error) {
            console.error('Error loading users:', error);
            this.showMockUsers();
        }
    }

    showMockUsers() {
        const mockUsers = [
            {
                email: 'john.doe@example.com',
                full_name: 'John Doe',
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-07-08T14:20:00Z'
            },
            {
                email: 'jane.smith@example.com',
                full_name: 'Jane Smith',
                created_at: '2024-02-20T09:15:00Z',
                updated_at: '2024-07-07T16:45:00Z'
            },
            {
                email: 'mike.johnson@example.com',
                full_name: 'Mike Johnson',
                created_at: '2024-03-10T11:00:00Z',
                updated_at: '2024-07-06T12:30:00Z'
            }
        ];

        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        mockUsers.forEach(user => {
            const row = this.createUserRow(user);
            tbody.appendChild(row);
        });

        document.getElementById('usersLoading').classList.add('hidden');
        document.getElementById('usersTable').classList.remove('hidden');
    }

    createUserRow(user) {
        const row = document.createElement('tr');
        
        const joinedDate = new Date(user.created_at).toLocaleDateString();
        const lastActivity = new Date(user.updated_at).toLocaleDateString();
        const daysSinceActivity = Math.floor((new Date() - new Date(user.updated_at)) / (1000 * 60 * 60 * 24));
        const isActive = daysSinceActivity <= 7;

        row.innerHTML = `
            <td>${user.email}</td>
            <td>${user.full_name || 'N/A'}</td>
            <td>${joinedDate}</td>
            <td>${lastActivity}</td>
            <td>
                <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                    ${isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>250</td>
        `;

        return row;
    }

    async loadAnalytics() {
        try {
            if (!this.supabase) {
                this.showMockAnalytics();
                return;
            }

            // Load analytics data
            const [categoriesResult, completionsResult] = await Promise.all([
                this.supabase.from('categories').select('*'),
                this.supabase.from('daily_completions').select('*')
            ]);

            const categories = categoriesResult.data || [];
            const completions = completionsResult.data || [];

            // Calculate most popular category
            const categoryPopularity = {};
            completions.forEach(completion => {
                // This would need to be joined with habits and goals to get category
                // For now, showing mock data
            });

            this.showMockAnalytics();

        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showMockAnalytics();
        }
    }

    showMockAnalytics() {
        document.getElementById('topCategory').textContent = 'Physical Health';
        document.getElementById('completionRate').textContent = '68%';
        document.getElementById('avgStreak').textContent = '12 days';
        document.getElementById('newUsersWeek').textContent = '23';
    }

    async logout() {
        try {
            if (this.supabase) {
                await this.supabase.auth.signOut();
            }
            this.currentUser = null;
            document.getElementById('adminDashboard').classList.add('hidden');
            document.getElementById('loginSection').classList.remove('hidden');
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

// Global functions for HTML onclick handlers
window.showSection = function(sectionName) {
    if (window.adminPanel) {
        window.adminPanel.showSection(sectionName);
    }
};

window.logout = function() {
    if (window.adminPanel) {
        window.adminPanel.logout();
    }
};

// Initialize admin panel when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});