# 🌱 Plant Tracker Authentication Setup Guide

This guide will help you set up user authentication and database persistence for the Plant Tracker app using Supabase.

## 📋 Prerequisites

- A Supabase account (free at [supabase.com](https://supabase.com))
- Node.js and npm installed
- The Plant Tracker app already running locally

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `plant-tracker` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## 🔧 Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 📁 Step 3: Configure Environment Variables

1. In your Plant Tracker project root, create a `.env.local` file:

```bash
# Copy env.local.example to .env.local
cp env.local.example .env.local
```

2. Edit `.env.local` and replace the placeholder values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control. It should already be in `.gitignore`.

## 🗄️ Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire content from `database-schema.sql`
4. Click "Run" to execute the schema

This will create:
- ✅ `profiles` table for user information
- ✅ `plants` table for plant data
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation on user signup
- ✅ Performance indexes

## 🔐 Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your development URL:
   ```
   http://localhost:3000
   ```
3. Under **Redirect URLs**, add:
   ```
   http://localhost:3000
   ```
4. **Email Auth**: Already enabled by default
5. **Social Auth** (optional): Configure providers like Google, GitHub, etc.

## 🧪 Step 6: Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. You should see:
   - ✅ A "Sign In" button in the top right
   - ✅ A welcome message prompting login
   - ✅ The Tamagotchi character with a "sleeping" mood indicator

4. Test user registration:
   - Click "Sign In" or "Get Started"
   - Choose "Sign Up"
   - Enter email and password
   - Check your email for verification (in development, check Supabase Auth logs)

5. Test plant creation:
   - After logging in, add sample plants
   - Navigate to the plant list
   - Verify plants are saved and persist after page refresh

## 🔍 Verification Checklist

- [ ] Environment variables are correctly set
- [ ] Database schema is created without errors
- [ ] User can sign up and receive verification email
- [ ] User can sign in after email verification
- [ ] Plants are saved to database and persist
- [ ] User can only see their own plants
- [ ] Sign out works correctly

## 🛠️ Features Implemented

### Authentication System
- ✅ **Sign Up/Sign In Modal**: Beautiful animated modal with form validation
- ✅ **User Sessions**: Persistent login state across browser sessions
- ✅ **Profile Management**: Automatic profile creation with username support
- ✅ **Secure Sign Out**: Clean session termination

### Database Integration
- ✅ **User-Scoped Plants**: Each user only sees their own plants
- ✅ **Real-time Sync**: Plants sync between devices when logged in
- ✅ **Offline Support**: Local storage fallback when database is unavailable
- ✅ **Row Level Security**: Database-level security ensuring data privacy

### UI/UX Enhancements
- ✅ **User Welcome Flow**: Onboarding for new users
- ✅ **Authentication States**: Different UI based on login status
- ✅ **Loading States**: Smooth loading indicators during auth operations
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Mood Indicators**: Tamagotchi shows different moods based on auth state

## 🐛 Troubleshooting

### "Invalid API Key" Error
- Double-check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure there are no extra spaces or quotes in `.env.local`
- Restart your development server after changing environment variables

### "User not authenticated" Error
- Check if email verification is required
- Verify the user's email in Supabase Auth dashboard
- Check browser developer tools for auth errors

### Plants Not Saving
- Verify the database schema was created successfully
- Check Supabase logs for any RLS policy violations
- Ensure the user is properly authenticated

### Database Connection Issues
- Verify your Supabase project is active (not paused)
- Check your internet connection
- Try refreshing the Supabase API keys

## 🚀 Production Deployment

When deploying to production:

1. **Update Site URL** in Supabase Auth settings
2. **Add production domain** to redirect URLs
3. **Set environment variables** in your hosting platform
4. **Enable email confirmations** for security
5. **Consider social auth** for better UX

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

🎉 **Congratulations!** Your Plant Tracker now has a complete authentication system with user-specific plant management. Users can securely sign up, manage their plants, and have their data synced across devices. 