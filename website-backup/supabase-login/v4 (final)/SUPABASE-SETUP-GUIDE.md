# Supabase Setup Guide for LearnTAV Admin Panel

This guide will help you set up Supabase to work with the LearnTAV admin panel and enable full functionality for managing enrollments, consultations, and user data.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

## Step 2: Configure Environment

1. Open `assets/auth/supabase-client.js`
2. Replace the placeholder values with your actual Supabase credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co' // Your actual project URL
const SUPABASE_ANON_KEY = 'your-anon-key-here' // Your actual anon key
```

## Step 3: Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Copy and paste the entire contents of `database-schema.sql`
3. Run the SQL to create all necessary tables, policies, and functions

This will create:
- `users` table (mirrors auth.users)
- `courses` table (for course management)
- `enrollments` table (tracks course enrollments)
- `consults` table (consultation bookings)
- `contact_submissions` table (contact form submissions)
- `site_settings` table (admin code and other settings)
- `admin_users` table (identifies admin users)
- `admin_logs` table (tracks admin actions)

## Step 4: Set Up Your Admin User

1. Create a regular user account through Supabase Auth (or your site's signup)
2. Find your user ID in the Supabase Auth dashboard
3. In the SQL Editor, run this command to make yourself an admin:

```sql
INSERT INTO public.admin_users (user_id) 
VALUES ('your-auth-user-id-here');
```

Replace `your-auth-user-id-here` with your actual user ID from the auth dashboard.

## Step 5: Configure Row Level Security (RLS)

The schema automatically sets up RLS policies, but verify they're active:

1. Go to Authentication → Policies in your Supabase dashboard
2. Ensure all tables have RLS enabled
3. Verify policies are created for each table

## Step 6: Test Admin Access

1. Sign in to your website with the admin user account
2. Go to `/admin/` 
3. For the keypad, type: `0`, `2`, `4`, `6` (the system adds 2 to each number, so this becomes `2468`)
4. You should see the admin dashboard with the admin code displayed at the top

## Step 7: Verify Data Flow

### Test Enrollment Flow:
1. Add enrollment buttons to your course pages with classes `enroll-btn` and data attributes:
```html
<button class="enroll-btn" 
        data-course="vibe-coding-101" 
        data-title="Vibe Coding 101" 
        data-price="99.00">
  Enroll Now
</button>
```

2. Import the enrollment handler:
```html
<script type="module" src="/assets/js/enrollment-handler.js"></script>
```

### Test Consultation Flow:
1. Add consultation booking buttons with classes `book-consult-btn`:
```html
<button class="book-consult-btn" 
        data-timeslot="2024-01-15T14:00:00" 
        data-duration="60">
  Book Consultation
</button>
```

2. Import the consultation handler:
```html
<script type="module" src="/assets/js/consult-handler.js"></script>
```

## Step 8: Set Up Realtime (Optional)

To get live updates in the admin panel:

1. In Supabase → Settings → API, enable Realtime for these tables:
   - `enrollments`
   - `consults`
   - `contact_submissions`
   - `users`

## Step 9: Security Checklist

✅ RLS is enabled on all tables
✅ Service role key is NOT exposed in client-side code
✅ Admin users are properly identified via `admin_users` table
✅ Policies allow users to see only their own data
✅ Policies allow admins to see all data

## Troubleshooting

### Common Issues:

**Admin panel shows "Access denied":**
- Verify your user ID is in the `admin_users` table
- Check that RLS policies are properly configured

**No data showing in admin panel:**
- Verify Supabase URL and anon key are correct
- Check browser console for connection errors
- Ensure RLS policies allow admin access

**Enrollments/consultations not saving:**
- Verify user is authenticated before attempting to save
- Check that the forms have proper class names
- Review browser console for JavaScript errors

**Admin code not displaying:**
- Verify `site_settings` table has an `admin_code` entry
- Check that admin user has permission to read `site_settings`

### Reset Admin Code:

If you need to change the admin code:

```sql
UPDATE public.site_settings 
SET value = '1357' 
WHERE key = 'admin_code';
```

Remember: Users will need to type digits that are 2 less than the target (e.g., for code 1357, type 9135).

## Production Deployment

Before going live:

1. ✅ Replace placeholder Supabase credentials with production values
2. ✅ Set up proper domain configuration in Supabase
3. ✅ Configure email templates for auth flows
4. ✅ Set up webhook endpoints for payment processing
5. ✅ Test all admin panel functionality
6. ✅ Verify RLS policies work correctly
7. ✅ Set up monitoring and logging

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all SQL policies are correctly applied
4. Test with simple operations first before complex workflows

The admin panel will show "Loading..." or "Error" states when configuration is incomplete.