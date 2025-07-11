// Configuration for Admin Panel
// Replace these with your actual Supabase credentials

const CONFIG = {
    // Supabase Configuration - Production values will be injected by Vercel
    SUPABASE_URL: window.ENV?.SUPABASE_URL || 'https://brvxvnbrshyhltwlfmcp.supabase.co',
    SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydnh2bmJyc2h5aGx0d2xmbWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTA0MDUsImV4cCI6MjA2NzM2NjQwNX0.0dbes42M9jURB_OhGfyHIC8nIFfDCeUGPxMtXxQDu24',
    
    // Admin Configuration
    ADMIN_EMAIL_DOMAINS: window.ENV?.ADMIN_EMAIL_DOMAINS?.split(',') || ['@lifespark.com', '@admin.lifespark.com'],
    ADMIN_USERS: window.ENV?.ADMIN_USERS?.split(',') || [
        'admin@lifespark.com',
        'support@lifespark.com'
    ],
    
    // App Configuration
    APP_NAME: 'Lifespark Admin Panel',
    VERSION: '1.0.0'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}