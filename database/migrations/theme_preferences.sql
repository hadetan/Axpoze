-- Add theme_preference column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark'));

-- Update RLS policies
CREATE POLICY "Users can update their own theme preference"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
