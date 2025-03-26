-- Create savings history table
CREATE TABLE public.savings_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.savings(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_savings_history_goal_id ON public.savings_history(goal_id);
CREATE INDEX idx_savings_history_date ON public.savings_history(date);

-- Enable RLS
ALTER TABLE public.savings_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own savings history"
    ON public.savings_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.savings
        WHERE savings.id = savings_history.goal_id
        AND savings.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own savings history"
    ON public.savings_history FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.savings
        WHERE savings.id = savings_history.goal_id
        AND savings.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own savings history"
    ON public.savings_history FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.savings
        WHERE savings.id = savings_history.goal_id
        AND savings.user_id = auth.uid()
    ));

-- Create goal progress calculation function
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_id UUID)
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

-- Set function permissions
REVOKE ALL ON FUNCTION calculate_goal_progress(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION calculate_goal_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_goal_progress(UUID) TO service_role;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON public.savings_history TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
