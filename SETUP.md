# Plant Tracker Setup Guide

## Database Configuration (Optional)

The Plant Tracker app works offline by default, but you can enable cloud sync by setting up a Supabase database.

### Option 1: Run Offline (Default)
No setup required! Your plants are saved locally in your browser.

### Option 2: Enable Cloud Sync with Supabase

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Set Up Database Tables**
   
   Run this SQL in your Supabase SQL editor:
   
   ```sql
   -- Create profiles table
   CREATE TABLE IF NOT EXISTS profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
     email TEXT NOT NULL,
     username TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   -- Create plants table
   CREATE TABLE IF NOT EXISTS plants (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     "userId" UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
     name TEXT NOT NULL,
     species TEXT NOT NULL,
     "plantedDate" TIMESTAMP WITH TIME ZONE NOT NULL,
     "plantingDate" TIMESTAMP WITH TIME ZONE NOT NULL,
     "lastWatered" TIMESTAMP WITH TIME ZONE,
     notes TEXT,
     "noteAttachments" TEXT[],
     "imageUrl" TEXT,
     "wateringFrequency" INTEGER NOT NULL DEFAULT 7,
     status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'needs_water', 'overdue')),
     icon TEXT NOT NULL,
     "iconColor" TEXT NOT NULL,
     "nextWatering" TEXT,
     "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can view own plants" ON plants
     FOR SELECT USING (auth.uid() = "userId");

   CREATE POLICY "Users can insert own plants" ON plants
     FOR INSERT WITH CHECK (auth.uid() = "userId");

   CREATE POLICY "Users can update own plants" ON plants
     FOR UPDATE USING (auth.uid() = "userId");

   CREATE POLICY "Users can delete own plants" ON plants
     FOR DELETE USING (auth.uid() = "userId");
   ```

3. **Get Your Credentials**
   - Go to Settings > API in your Supabase dashboard
   - Copy the Project URL and anon/public key

4. **Create Environment File**
   
   Create a `.env.local` file in your project root:
   
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Plants Not Saving to Database
- Check that your `.env.local` file exists and has the correct values
- Verify your Supabase project is active
- Check the browser console for error messages

### Authentication Issues
- Make sure Row Level Security policies are enabled
- Verify your Supabase auth settings
- Check if email confirmation is required

### Local Development
- The app works completely offline without any database setup
- Plants are stored in your browser's local storage
- No authentication required for local-only mode

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Test your Supabase connection in the Supabase dashboard
4. The app will fall back to local storage if the database is unavailable 