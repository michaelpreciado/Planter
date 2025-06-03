# 🌱 Enable Cross-Device Plant Data Sync

Your Planter app is **already built for cross-device sync** but needs Supabase configured to work! Here's how to get your plant data syncing between desktop and mobile:

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a **free account**
3. Click "New Project"
4. Choose an organization, project name, and password

### Step 2: Get Your API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (looks like `https://abcdefgh.supabase.co`)
3. Copy your **anon public key** (starts with `eyJ...`)

### Step 3: Configure Environment Variables

Create a file called `.env.local` in your project root with:

```bash
# Replace with your actual values from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Set Up Database Tables

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Create plants table
CREATE TABLE plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT,
  plantedDate TIMESTAMPTZ,
  plantingDate TIMESTAMPTZ,
  wateringFrequency INTEGER NOT NULL DEFAULT 7,
  icon TEXT DEFAULT '🌱',
  iconColor TEXT DEFAULT '#10B981',
  lastWatered TIMESTAMPTZ,
  nextWatering TIMESTAMPTZ,
  status TEXT DEFAULT 'healthy',
  notes TEXT,
  noteAttachments TEXT[],
  imageUrl TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only access their own data
CREATE POLICY "Users can only see their own plants" ON plants
  FOR ALL USING (auth.uid() = userId);

CREATE POLICY "Users can only see their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
```

### Step 5: Deploy & Test
1. Save your `.env.local` file
2. Restart your development server: `npm run dev`
3. Deploy your app (the environment variables will be used)
4. Test by adding a plant on desktop, then checking mobile!

## ✅ What Happens After Setup

- **Automatic Sync**: Plants added on any device appear on all devices
- **Offline Support**: Still works without internet, syncs when reconnected  
- **User Authentication**: Each user sees only their own plants
- **Real-time Updates**: Changes appear immediately across devices

## 🔧 Alternative: Quick Test Without Database

If you want to test sync immediately without setting up Supabase:

1. Go to your test page: `/test`
2. Add some plants on desktop
3. Copy the localStorage data manually to mobile (browser dev tools)
4. This is temporary - use Supabase for permanent sync!

## ❓ Need Help?

- Check browser console for "Database not configured" messages
- Verify environment variables are set correctly
- Make sure to restart your dev server after adding `.env.local`
- Check Supabase dashboard for any error logs

Your app is **already built for sync** - it just needs the database connection! 🎉 