import { supabase } from './supabase';

export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    body: {},
  });

  if (error) {
    throw error;
  }

  return data as { success: boolean };
}