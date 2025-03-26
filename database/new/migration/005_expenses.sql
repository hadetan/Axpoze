-- Create expense categories table first
CREATE TABLE public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create expenses table with proper relationship
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL,
    payment_mode TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_expense_categories_user_id ON public.expense_categories(user_id);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);

-- Add triggers for updated_at
CREATE TRIGGER set_timestamp_expense_categories
    BEFORE UPDATE ON public.expense_categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_expenses
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS for expense_categories
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for expense_categories
CREATE POLICY "Users can view their own expense categories"
    ON public.expense_categories FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own expense categories"
    ON public.expense_categories FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expense categories"
    ON public.expense_categories FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own expense categories"
    ON public.expense_categories FOR DELETE
    USING (user_id = auth.uid());

-- Enable RLS for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for expenses
CREATE POLICY "Users can view their own expenses"
    ON public.expenses FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expenses"
    ON public.expenses FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own expenses"
    ON public.expenses FOR DELETE
    USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.expense_categories TO authenticated;
GRANT ALL ON public.expenses TO authenticated;
