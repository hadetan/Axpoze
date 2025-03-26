-- Create main savings table
CREATE TABLE public.savings (
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

-- Create index for better performance
CREATE INDEX idx_savings_user_id ON public.savings(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp_savings
    BEFORE UPDATE ON public.savings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON public.savings TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
