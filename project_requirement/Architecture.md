# Axpoze - Architecture

## Technical Stack

- Frontend: React (Create React App) typescript
- Styling: Custom CSS
- Backend/Database: Supabase
- Authentication: Supabase Auth

## Database Schema (Supabase)

### users

- id: uuid (PK)
- email: text
- full_name: text
- currency_preference: text
- theme_preference: enum (light, dark)
- created_at: timestamp
- updated_at: timestamp

### expense_categories

- id: uuid (PK)
- user_id: uuid (FK)
- name: text
- color: text
- icon: text
- created_at: timestamp
- updated_at: timestamp

### expenses

- id: uuid (PK)
- user_id: uuid (FK)
- category_id: uuid (FK)
- amount: numeric
- description: text
- date: date
- payment_mode: enum (Cash, Card, UPI, Other)
- created_at: timestamp
- updated_at: timestamp

### savings

- id: uuid (PK)
- user_id: uuid (FK)
- goal_name: text
- target_amount: numeric
- current_amount: numeric
- type: enum (Emergency, Investment, Goal)
- created_at: timestamp
- updated_at: timestamp

### income_tracking

- id: uuid (PK)
- user_id: uuid (FK)
- amount: numeric
- date: date
- type: text
- notes: text
- created_at: timestamp
- updated_at: timestamp

### notification_preferences
- id: uuid (PK)
- user_id: uuid (FK)
- goal_deadline_reminder: boolean
- deadline_days_threshold: integer
- goal_progress_alert: boolean
- progress_threshold: integer
- monthly_spending_alert: boolean
- spending_threshold: integer
- email_notifications: boolean
- notification_types: text[]
- created_at: timestamp
- updated_at: timestamp

## Frontend Architecture

### Directory Structure

```plaintext
src/
├── assets/              # Images, icons, etc.
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard and analytics
│   ├── expenses/       # Expense management
│   ├── savings/        # Savings management
│   ├── profile/        # User profile components
│   └── shared/         # Common components
├── contexts/           # React context providers
├── pages/              # Main page components
├── styles/             # CSS files
├── services/           # API and Supabase services
├── utils/             # Utility functions
└── types/            # TypeScript interfaces
```

## Required Supabase Setup

1. Create new Supabase project
2. Run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE theme_preference AS ENUM ('light', 'dark');
CREATE TYPE payment_mode AS ENUM ('Cash', 'Card', 'UPI', 'Other');
CREATE TYPE saving_type AS ENUM ('Emergency', 'Investment', 'Goal');

-- Create tables (implement the schema defined above)

-- Create savings table
CREATE TABLE savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    goal_name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create income_tracking table
CREATE TABLE income_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    goal_deadline_reminder BOOLEAN DEFAULT true,
    deadline_days_threshold INTEGER DEFAULT 7,
    goal_progress_alert BOOLEAN DEFAULT true,
    progress_threshold INTEGER DEFAULT 20,
    monthly_spending_alert BOOLEAN DEFAULT true,
    spending_threshold INTEGER DEFAULT 120,
    email_notifications BOOLEAN DEFAULT true,
    notification_types TEXT[] DEFAULT ARRAY['goal', 'expense', 'system'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);
```

## Authentication Flow

1. Username/Password authentication using Supabase Auth
2. Protected routes with React Router guards
3. Persist user session
