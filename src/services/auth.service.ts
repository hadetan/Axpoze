import { createClient } from '@supabase/supabase-js';
import { ISignupForm } from '../types/auth.types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class AuthService {
  async signUp(formData: ISignupForm) {
    try {
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user?.id) {
        throw new Error('No user ID returned from signup');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert([
          {
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
          },
        ], 
        { onConflict: 'id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't delete the auth user, just log the error
        throw new Error('Failed to create user profile: ' + profileError.message);
      }

      return authData;
    } catch (error: any) {
      console.error('Signup process error:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  }
}

export const authService = new AuthService();
