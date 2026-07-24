import type { Trip } from '../components/TripsScreen';
import { supabase } from './supabase';

type TripRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  province_id: string;
  notes: string | null;
  image_uri: string | null;
  is_public: boolean | null;
};

function mapTripRow(row: TripRow): Trip {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    provinceId: row.province_id,
    notes: row.notes ?? '',
    imageUri: row.image_uri ?? undefined,
    isPublic: row.is_public ?? true,
  };
}

export async function fetchTrips(userId: string) {
  const { data, error } = await supabase
    .from('trips')
    .select(
      'id, name, start_date, end_date, province_id, notes, image_uri, is_public'
    )
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapTripRow(row as TripRow));
}

export async function createTrip(userId: string, trip: Trip) {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      name: trip.name,
      start_date: trip.startDate,
      end_date: trip.endDate,
      province_id: trip.provinceId,
      notes: trip.notes,
      image_uri: trip.imageUri ?? null,
      is_public: trip.isPublic ?? true,
    })
    .select(
      'id, name, start_date, end_date, province_id, notes, image_uri, is_public'
    )
    .single();

  if (error) {
    throw error;
  }

  return mapTripRow(data as TripRow);
}

export async function updateTripInSupabase(userId: string, trip: Trip) {
  const { data, error } = await supabase
    .from('trips')
    .update({
      name: trip.name,
      start_date: trip.startDate,
      end_date: trip.endDate,
      province_id: trip.provinceId,
      notes: trip.notes,
      image_uri: trip.imageUri ?? null,
      is_public: trip.isPublic ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', trip.id)
    .eq('user_id', userId)
    .select(
      'id, name, start_date, end_date, province_id, notes, image_uri, is_public'
    )
    .single();

  if (error) {
    throw error;
  }

  return mapTripRow(data as TripRow);
}

export async function deleteTripFromSupabase(userId: string, tripId: string) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}