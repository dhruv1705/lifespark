# Lifespark Admin Panel

A simple web-based admin panel for managing users and monitoring the Lifespark wellness app.

## Features

- **Dashboard**: Overview of key metrics (total users, active users, habit completions, average XP)
- **User Management**: View all users with registration dates, activity status, and basic information
- **Analytics**: Basic analytics including popular categories and completion rates
- **Authentication**: Secure admin login with configurable admin privileges

## Setup

1. **Configure Supabase Credentials**
   - Open `config.js`
   - Replace placeholder values with your actual Supabase project credentials:
     ```javascript
     SUPABASE_URL: 'https://your-project-id.supabase.co',
     SUPABASE_ANON_KEY: 'your-anon-key-here',
     ```

2. **Configure Admin Users**
   - In `config.js`, add admin email addresses to `ADMIN_USERS` array
   - Or configure admin email domains in `ADMIN_EMAIL_DOMAINS`

3. **Database Setup**
   - Ensure your Supabase database has the required tables:
     - `users` (with email, full_name, created_at, updated_at)
     - `daily_completions` (with xp_earned, created_at)
     - `categories`, `goals`, `habits` (for analytics)

4. **Serve the Admin Panel**
   - Use any web server to serve the admin files
   - For development: `python -m http.server 8000` or similar
   - For production: Deploy to your preferred hosting platform

## Usage

1. Open the admin panel in your browser
2. Login with an admin account
3. Navigate between Dashboard, Users, and Analytics sections
4. Monitor user activity and app performance

## Security Notes

- Always use HTTPS in production
- Implement proper Row Level Security (RLS) policies in Supabase
- Consider adding IP restrictions for admin access
- Regularly rotate admin credentials

## File Structure

```
admin/
├── index.html      # Main admin interface
├── admin.js        # Admin panel logic
├── config.js       # Configuration settings
└── README.md       # This file
```

## Development

The admin panel works in both online and offline modes:
- **Online**: Connects to Supabase for real-time data
- **Offline**: Shows mock data when Supabase is not available

To extend functionality:
1. Add new sections to `index.html`
2. Implement corresponding logic in `admin.js`
3. Update navigation in `showSection()` method

## Troubleshooting

- **Login fails**: Check Supabase credentials and admin user configuration
- **No data shown**: Verify database connection and table structure
- **Permission errors**: Ensure proper RLS policies are configured
- **Styling issues**: Check that theme colors match your app design