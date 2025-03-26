-- Create savings milestones table
CREATE TABLE public.savings_milestones (
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

-- Create indexes
CREATE INDEX idx_savings_milestones_goal_id ON public.savings_milestones(goal_id);
CREATE INDEX idx_savings_milestones_achieved ON public.savings_milestones(achieved);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON public.savings_milestones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS
ALTER TABLE public.savings_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own milestones"
    ON public.savings_milestones FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.savings
        WHERE savings.id = savings_milestones.goal_id
        AND savings.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own milestones"
    ON public.savings_milestones FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.savings
        WHERE savings.id = savings_milestones.goal_id
        AND savings.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own milestones"
    ON public.savings_milestones FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.savings
        WHERE savings.id = savings_milestones.goal_id
        AND savings.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own milestones"
    ON public.savings_milestones FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.savings
        WHERE savings.id = savings_milestones.goal_id
        AND savings.user_id = auth.uid()
    ));
