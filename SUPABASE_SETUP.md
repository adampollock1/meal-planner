# Supabase Setup Instructions

Follow these steps to complete the Supabase integration for your Meal Planner app.

## Step 1: Set Up Supabase Project

If you haven't already, go to [supabase.com](https://supabase.com) and create a new project.

## Step 2: Run the Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `supabase-schema.sql` from your project
5. Click **Run** to execute the SQL

This creates:
- `user_settings` table - Stores user preferences
- `meals` table - Stores meal plans
- `favorites` table - Stores favorite meals
- `conversations` table - Stores Chef Alex chat history
- Row Level Security policies - Ensures users can only access their own data
- A trigger that automatically creates user settings when someone signs up

## Step 3: Get Your Supabase Credentials

1. In your Supabase Dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 4: Configure Local Environment

Update your `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Add Environment Variables to Vercel

1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add these variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_GROQ_API_KEY` = your Groq API key (if not already added)
5. Click **Save**
6. **Redeploy** your project for the changes to take effect

## Step 6: Configure Auth Settings (Optional)

In your Supabase Dashboard, go to **Authentication** > **Settings**:

1. **Email Confirmations**: You can disable "Confirm email" for easier testing
2. **Site URL**: Set to your Vercel production URL (e.g., `https://your-app.vercel.app`)
3. **Redirect URLs**: Add your production and localhost URLs

## Testing the Integration

1. Run `npm run dev` locally
2. Navigate to the Account page
3. Create a new account with email/password
4. Add some meals and favorites
5. Sign out and sign back in - your data should persist!

## Troubleshooting

### "Email not confirmed" error
- Go to Supabase Dashboard > Authentication > Settings
- Disable "Confirm email" for testing, or check your email for confirmation link

### Data not loading
- Check browser console for errors
- Verify your environment variables are set correctly
- Make sure you ran the SQL schema

### RLS policy errors
- Make sure you ran the full SQL schema including the policies
- Check that `auth.uid()` is returning the correct user ID

## Security Notes

- The `anon` key is safe to expose in the frontend - RLS policies protect your data
- Never expose your `service_role` key in the frontend
- All data access is protected by Row Level Security
