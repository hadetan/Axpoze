-- Create savings_milestones table
CREATE TABLE IF NOT EXISTS public.savings_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.savings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    deadline TIMESTAMPTZ,
    description TEXT,
    achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT savings_milestones_target_amount_check CHECK (target_amount > 0)
);

-- Add indexes for better performance
CREATE INDEX idx_savings_milestones_goal_id ON public.savings_milestones(goal_id);
CREATE INDEX idx_savings_milestones_achieved ON public.savings_milestones(achieved);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON public.savings_milestones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Add RLS (Row Level Security) policies
ALTER TABLE public.savings_milestones ENABLE ROW LEVEL SECURITY;

-- Update RLS policies with correct syntax
DROP POLICY IF EXISTS "Users can view their own milestones" ON public.savings_milestones;
CREATE POLICY "Users can view their own milestones"
    ON public.savings_milestones
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.savings
            WHERE savings.id = savings_milestones.goal_id
            AND savings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own milestones" ON public.savings_milestones;
CREATE POLICY "Users can insert their own milestones"
    ON public.savings_milestones
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.savings
            WHERE savings.id = savings_milestones.goal_id
            AND savings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own milestones" ON public.savings_milestones;
CREATE POLICY "Users can update their own milestones"
    ON public.savings_milestones
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.savings
            WHERE savings.id = savings_milestones.goal_id
            AND savings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own milestones" ON public.savings_milestones;
CREATE POLICY "Users can delete their own milestones"
    ON public.savings_milestones
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.savings
            WHERE savings.id = savings_milestones.goal_id
            AND savings.user_id = auth.uid()
        )
    );

-- Update the check constraint for target_amount
ALTER TABLE IF EXISTS public.savings_milestones 
  DROP CONSTRAINT IF EXISTS savings_milestones_target_amount_check;

ALTER TABLE public.savings_milestones 
  ADD CONSTRAINT savings_milestones_target_amount_check 
  CHECK (target_amount > 0);
