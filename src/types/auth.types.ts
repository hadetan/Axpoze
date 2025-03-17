import { User } from '@supabase/supabase-js';

export interface ILoginForm {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface ISignupForm extends ILoginForm {
    fullName: string;
    confirmPassword: string;
}

export interface IAuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
}

export type AuthError = {
    message: string;
    status?: number;
};
