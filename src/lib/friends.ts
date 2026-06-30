import { supabase } from './supabase';

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export type PublicProfile = {
  id: string;
  name: string;
};

export type FriendRequest = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  requester?: PublicProfile;
  receiver?: PublicProfile;
};

type FriendRequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: FriendRequestStatus;
  created_at: string;
};

function mapFriendRequest(
  row: FriendRequestRow,
  profilesById: Record<string, PublicProfile>
): FriendRequest {
  return {
    id: row.id,
    requesterId: row.requester_id,
    receiverId: row.receiver_id,
    status: row.status,
    createdAt: row.created_at,
    requester: profilesById[row.requester_id],
    receiver: profilesById[row.receiver_id],
  };
}

async function fetchProfilesByIds(profileIds: string[]) {
  const uniqueProfileIds = [...new Set(profileIds)].filter(Boolean);

  if (uniqueProfileIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', uniqueProfileIds);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce<Record<string, PublicProfile>>((profiles, row) => {
    profiles[row.id] = {
      id: row.id,
      name: row.name ?? 'Usuario',
    };

    return profiles;
  }, {});
}

export async function searchProfiles(currentUserId: string, searchText: string) {
  const cleanSearchText = searchText.trim();

  if (cleanSearchText.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .neq('id', currentUserId)
    .ilike('name', `%${cleanSearchText}%`)
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []).map((profile) => ({
    id: profile.id,
    name: profile.name ?? 'Usuario',
  })) as PublicProfile[];
}

export async function sendFriendRequest(
  requesterId: string,
  receiverId: string
) {
  const { data: existingRequests, error: existingError } = await supabase
    .from('friend_requests')
    .select('id, status, requester_id, receiver_id')
    .or(
      `and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`
    );

  if (existingError) {
    throw existingError;
  }

  const existingRequest = existingRequests?.[0];

  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      throw new Error('Ya existe una solicitud pendiente.');
    }

    if (existingRequest.status === 'accepted') {
      throw new Error('Ya sois amigos.');
    }

    throw new Error('Ya existía una solicitud anterior con este usuario.');
  }

  const { error } = await supabase.from('friend_requests').insert({
    requester_id: requesterId,
    receiver_id: receiverId,
    status: 'pending',
  });

  if (error) {
    throw error;
  }
}

export async function fetchReceivedFriendRequests(userId: string) {
  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, requester_id, receiver_id, status, created_at')
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FriendRequestRow[];

  const profilesById = await fetchProfilesByIds(
    rows.flatMap((row) => [row.requester_id, row.receiver_id])
  );

  return rows.map((row) => mapFriendRequest(row, profilesById));
}

export async function fetchSentFriendRequests(userId: string) {
  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, requester_id, receiver_id, status, created_at')
    .eq('requester_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FriendRequestRow[];

  const profilesById = await fetchProfilesByIds(
    rows.flatMap((row) => [row.requester_id, row.receiver_id])
  );

  return rows.map((row) => mapFriendRequest(row, profilesById));
}

export async function fetchFriends(userId: string) {
  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, requester_id, receiver_id, status, created_at')
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FriendRequestRow[];

  const profilesById = await fetchProfilesByIds(
    rows.flatMap((row) => [row.requester_id, row.receiver_id])
  );

  return rows
    .map((row) => {
      const friendId =
        row.requester_id === userId ? row.receiver_id : row.requester_id;

      return profilesById[friendId];
    })
    .filter(Boolean) as PublicProfile[];
}

export async function acceptFriendRequest(requestId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) {
    throw error;
  }
}

export async function rejectFriendRequest(requestId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) {
    throw error;
  }
}

export async function removeFriendRequest(requestId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('id', requestId);

  if (error) {
    throw error;
  }
}