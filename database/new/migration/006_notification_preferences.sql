-- Create notification types enum if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'EXPENSE_LIMIT',
            'SAVINGS_GOAL',
            'BILL_DUE',
            'MILESTONE_REACHED'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
        CREATE TYPE notification_channel AS ENUM (
            'EMAIL',
            'PUSH',
            'IN_APP'
        );
    END IF;
END $$;

-- Drop and recreate notification preferences table with modified constraints
DROP TABLE IF EXISTS public.notification_preferences;
CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type notification_type,
    channel notification_channel,
    enabled BOOLEAN DEFAULT true,
    threshold NUMERIC,
    goal_deadline_reminder BOOLEAN DEFAULT true,
    deadline_days_threshold INTEGER DEFAULT 7,
    goal_progress_alert BOOLEAN DEFAULT true,
    progress_threshold INTEGER DEFAULT 20,
    monthly_spending_alert BOOLEAN DEFAULT true,
    spending_threshold INTEGER DEFAULT 120,
    email_notifications BOOLEAN DEFAULT true,
    notification_types TEXT[] DEFAULT ARRAY['goal', 'expense', 'system'],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_notification_preferences_user_id'
    ) THEN
        CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
    END IF;
END $$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_timestamp_notification_preferences ON public.notification_preferences;
CREATE TRIGGER set_timestamp_notification_preferences
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification preferences"
    ON public.notification_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notification preferences"
    ON public.notification_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
    ON public.notification_preferences FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notification preferences"
    ON public.notification_preferences FOR DELETE
    USING (user_id = auth.uid());

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON public.notification_preferences TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Grant access to types
GRANT USAGE ON TYPE notification_type TO authenticated, service_role;
GRANT USAGE ON TYPE notification_channel TO authenticated, service_role;
