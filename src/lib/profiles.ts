import { supabase } from './supabase';

export type Profile = {
  name: string;
  avatarUrl?: string;
};

type ProfileRow = {
  name: string | null;
  avatar_url: string | null;
};

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const profile = data as ProfileRow | null;

  return {
    name: profile?.name?.trim() ?? '',
    avatarUrl: profile?.avatar_url ?? undefined,
  } as Profile;
}

export async function fetchProfileName(userId: string) {
  const profile = await fetchProfile(userId);

  return profile.name;
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: avatarUrl,
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}