import { supabase } from './supabase';

/**
 * Customer Authentication Flow
 * Uses Phone OTP. Profile role is implicitly 'customer' via trigger metadata.
 */
export async function sendCustomerOTP(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      data: { role: 'customer' } // Trigger will use this to assign role in public.profiles
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Farmer Authentication Flow
 * Uses Phone OTP. Profile role is explicitly set to 'farmer'.
 */
export async function sendFarmerOTP(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      data: { role: 'farmer' } // Trigger will also create an empty farmer record
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Verify OTP (Used by both Farmer and Customer)
 */
export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

/**
 * Admin Authentication Flow
 * Uses Email + Password.
 */
export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
