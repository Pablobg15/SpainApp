import { supabase } from './supabase';

const TRIP_IMAGES_BUCKET = 'trip-images';

function getFileExtension(uri: string) {
  const cleanUri = uri.split('?')[0];
  const extension = cleanUri.split('.').pop()?.toLowerCase();

  if (extension === 'png') {
    return 'png';
  }

  if (extension === 'webp') {
    return 'webp';
  }

  return 'jpg';
}

function getContentType(extension: string) {
  if (extension === 'png') {
    return 'image/png';
  }

  if (extension === 'webp') {
    return 'image/webp';
  }

  return 'image/jpeg';
}

export function isSupabaseTripImageUrl(uri?: string) {
  return Boolean(uri?.includes('/storage/v1/object/public/trip-images/'));
}

export async function uploadTripImage(userId: string, imageUri: string) {
  const extension = getFileExtension(imageUri);
  const contentType = getContentType(extension);

  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(TRIP_IMAGES_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(TRIP_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}