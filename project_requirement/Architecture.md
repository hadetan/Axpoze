# Money Management System - Architecture

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
- amount: numeric
- description: text
- date: date
- saving_type: enum (Emergency, Investment, Goal)
- target_amount: numeric
- target_date: date
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
```

## Authentication Flow

1. Username/Password authentication using Supabase Auth
2. Protected routes with React Router guards
3. Persist user session
