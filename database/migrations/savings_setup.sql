-- Setup script for savings tables and functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create main savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    initial_amount NUMERIC NOT NULL DEFAULT 0 CHECK (initial_amount >= 0),
    type TEXT NOT NULL,
    priority TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add initial_amount column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'savings' 
        AND column_name = 'initial_amount'
    ) THEN
        ALTER TABLE public.savings 
        ADD COLUMN initial_amount NUMERIC NOT NULL DEFAULT 0 
        CHECK (initial_amount >= 0);
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Create savings history table
CREATE TABLE IF NOT EXISTS public.savings_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (goal_id) REFERENCES public.savings(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON public.savings(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_history_goal_id ON public.savings_history(goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_history_date ON public.savings_history(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_savings
    BEFORE UPDATE ON public.savings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Function for calculating goal progress
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  -- Calculate total contributions
  RETURN COALESCE(
    (SELECT SUM(amount)
     FROM savings_history
     WHERE savings_history.goal_id = calculate_goal_progress.goal_id),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own savings" ON public.savings;
DROP POLICY IF EXISTS "Users can create their own savings" ON public.savings;
DROP POLICY IF EXISTS "Users can update their own savings" ON public.savings;
DROP POLICY IF EXISTS "Users can delete their own savings" ON public.savings;

DROP POLICY IF EXISTS "Users can view their own savings history" ON public.savings_history;
DROP POLICY IF EXISTS "Users can insert their own savings history" ON public.savings_history;
DROP POLICY IF EXISTS "Users can delete their own savings history" ON public.savings_history;

-- Savings table policies
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own savings"
    ON public.savings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own savings"
    ON public.savings FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own savings"
    ON public.savings FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own savings"
    ON public.savings FOR DELETE
    USING (user_id = auth.uid());

-- Savings history policies
ALTER TABLE public.savings_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own savings history"
    ON public.savings_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.savings s
        WHERE s.id = savings_history.goal_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own savings history"
    ON public.savings_history FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.savings s
        WHERE s.id = savings_history.goal_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own savings history"
    ON public.savings_history FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.savings s
        WHERE s.id = savings_history.goal_id
        AND s.user_id = auth.uid()
    ));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_goal_progress(UUID) TO anon, authenticated;
