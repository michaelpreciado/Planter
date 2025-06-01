-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- Create profiles table to extend the default auth.users
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create plant status enum
CREATE TYPE plant_status AS ENUM ('healthy', 'needs_water', 'overdue');

-- Create plants table
CREATE TABLE public.plants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    planted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    planting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL, -- Duplicate for compatibility
    watering_frequency INTEGER NOT NULL DEFAULT 7, -- Days between watering
    icon TEXT NOT NULL DEFAULT '🌱',
    icon_color TEXT NOT NULL DEFAULT '#10B981',
    last_watered TIMESTAMP WITH TIME ZONE,
    next_watering TEXT, -- Human readable next watering date
    status plant_status NOT NULL DEFAULT 'healthy',
    notes TEXT,
    note_attachments TEXT[], -- Array of image URLs
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for plants
CREATE POLICY "Users can view their own plants" ON public.plants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants" ON public.plants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants" ON public.plants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants" ON public.plants
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_plants_updated_at
    BEFORE UPDATE ON public.plants
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_plants_user_id ON public.plants(user_id);
CREATE INDEX idx_plants_status ON public.plants(status);
CREATE INDEX idx_plants_next_watering ON public.plants(created_at DESC);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Insert some sample data (optional - you can skip this in production)
-- This will be handled by the app's sample data function instead 