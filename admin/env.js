// Environment variables injection script for Vercel
// This will be populated by Vercel's build process

window.ENV = {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    ADMIN_EMAIL_DOMAINS: process.env.ADMIN_EMAIL_DOMAINS,
    ADMIN_USERS: process.env.ADMIN_USERS
};