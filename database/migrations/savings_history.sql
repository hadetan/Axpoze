-- Create savings_history table
CREATE TABLE IF NOT EXISTS public.savings_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.savings(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_goal
        FOREIGN KEY(goal_id)
        REFERENCES public.savings(id)
        ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_savings_history_goal_id ON public.savings_history(goal_id);
CREATE INDEX idx_savings_history_date ON public.savings_history(date);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.savings_history ENABLE ROW LEVEL SECURITY;

-- Update RLS policies with correct syntax
DROP POLICY IF EXISTS "Users can view their own savings history" ON public.savings_history;
CREATE POLICY "Users can view their own savings history"
    ON public.savings_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.savings
            WHERE savings.id = savings_history.goal_id
            AND savings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own savings history" ON public.savings_history;
CREATE POLICY "Users can insert their own savings history"
    ON public.savings_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.savings
            WHERE savings.id = savings_history.goal_id
            AND savings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own savings history" ON public.savings_history;
CREATE POLICY "Users can delete their own savings history"
    ON public.savings_history
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.savings
            WHERE savings.id = savings_history.goal_id
            AND savings.user_id = auth.uid()
        )
    );

-- Clean up all possible function variations
DROP FUNCTION IF EXISTS public.calculate_goal_progress(UUID);
DROP FUNCTION IF EXISTS calculate_goal_progress(UUID);

-- Create a single, clean version of the function
CREATE OR REPLACE FUNCTION public.calculate_goal_progress(goal_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount)
         FROM public.savings_history
         WHERE savings_history.goal_id = calculate_goal_progress.goal_id),
        0
    );
END;
$$;

-- Set proper permissions
REVOKE ALL ON FUNCTION public.calculate_goal_progress(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_goal_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_goal_progress(UUID) TO service_role;

-- Document the function
COMMENT ON FUNCTION public.calculate_goal_progress(UUID) IS 'Calculates the total contributions for a given savings goal';
