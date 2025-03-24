-- First ensure users table exists
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    currency_preference TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Then add theme preference
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark'));

-- Ensure RLS policies exist
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
    ON public.users 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Ensure update policy exists
DROP POLICY IF EXISTS "Users can update their own theme preference" ON public.users;
CREATE POLICY "Users can update their own theme preference"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
