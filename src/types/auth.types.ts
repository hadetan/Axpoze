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
    user: any | null;
    loading: boolean;
}
