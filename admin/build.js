const fs = require('fs');
const path = require('path');

// Read the environment template
const envTemplate = fs.readFileSync('env.js', 'utf8');

// Replace environment variables
const envContent = envTemplate
  .replace('process.env.VITE_SUPABASE_URL', `"${process.env.VITE_SUPABASE_URL || 'https://brvxvnbrshyhltwlfmcp.supabase.co'}"`)
  .replace('process.env.VITE_SUPABASE_ANON_KEY', `"${process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydnh2bmJyc2h5aGx0d2xmbWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTA0MDUsImV4cCI6MjA2NzM2NjQwNX0.0dbes42M9jURB_OhGfyHIC8nIFfDCeUGPxMtXxQDu24'}"`)
  .replace('process.env.ADMIN_EMAIL_DOMAINS', `"${process.env.ADMIN_EMAIL_DOMAINS || '@lifespark.com,@admin.lifespark.com'}"`)
  .replace('process.env.ADMIN_USERS', `"${process.env.ADMIN_USERS || 'admin@lifespark.com,support@lifespark.com'}"`);

// Write the processed environment file
fs.writeFileSync('env.js', envContent);

console.log('Environment variables injected successfully');