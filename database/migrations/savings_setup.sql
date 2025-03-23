-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create main savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    type TEXT NOT NULL,
    priority TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- Create savings milestones table
CREATE TABLE IF NOT EXISTS public.savings_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL,
    title TEXT NOT NULL,
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    deadline TIMESTAMPTZ,
    description TEXT,
    achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (goal_id) REFERENCES public.savings(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON public.savings(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_history_goal_id ON public.savings_history(goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_history_date ON public.savings_history(date);
CREATE INDEX IF NOT EXISTS idx_savings_milestones_goal_id ON public.savings_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_milestones_achieved ON public.savings_milestones(achieved);

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

CREATE TRIGGER set_timestamp_milestones
    BEFORE UPDATE ON public.savings_milestones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Create goal progress calculation function
CREATE OR REPLACE FUNCTION calculate_goal_progress(target_goal_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(sh.amount)
         FROM public.savings_history sh
         WHERE sh.goal_id = target_goal_id),
        0
    );
END;
$$;

-- Add RLS policies

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

-- Savings milestones policies
ALTER TABLE public.savings_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones"
    ON public.savings_milestones FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.savings s
        WHERE s.id = savings_milestones.goal_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own milestones"
    ON public.savings_milestones FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.savings s
        WHERE s.id = savings_milestones.goal_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own milestones"
    ON public.savings_milestones FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.savings s
        WHERE s.id = savings_milestones.goal_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own milestones"
    ON public.savings_milestones FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.savings s
        WHERE s.id = savings_milestones.goal_id
        AND s.user_id = auth.uid()
    ));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_goal_progress(UUID) TO anon, authenticated;
