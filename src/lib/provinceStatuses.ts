import type { ProvinceStatus } from '../components/SpainProvinceMap';
import { supabase } from './supabase';

type ProvinceStatusRow = {
  province_id: string;
  status: ProvinceStatus;
};

export async function fetchProvinceStatuses(userId: string) {
  const { data, error } = await supabase
    .from('province_statuses')
    .select('province_id, status')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce<Record<string, ProvinceStatus>>(
    (statuses, row: ProvinceStatusRow) => {
      statuses[row.province_id] = row.status;
      return statuses;
    },
    {}
  );
}

export async function upsertProvinceStatus(
  userId: string,
  provinceId: string,
  status: ProvinceStatus
) {
  const { error } = await supabase.from('province_statuses').upsert(
    {
      user_id: userId,
      province_id: provinceId,
      status,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,province_id',
    }
  );

  if (error) {
    throw error;
  }
}

export async function removeProvinceStatus(
  userId: string,
  provinceId: string
) {
  const { error } = await supabase
    .from('province_statuses')
    .delete()
    .eq('user_id', userId)
    .eq('province_id', provinceId);

  if (error) {
    throw error;
  }
}