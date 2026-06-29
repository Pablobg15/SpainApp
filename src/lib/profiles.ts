import { supabase } from './supabase';

type ProfileRow = {
  name: string | null;
};

export async function fetchProfileName(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const profile = data as ProfileRow | null;

  return profile?.name?.trim() ?? '';
}