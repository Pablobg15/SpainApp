import { supabase } from './supabase';

const PROFILE_IMAGES_BUCKET = 'profile-images';

function getFileExtension(uri: string) {
  const cleanUri = uri.split('?')[0];
  const extension = cleanUri.split('.').pop()?.toLowerCase();

  if (extension === 'png') {
    return 'png';
  }

  if (extension === 'webp') {
    return 'webp';
  }

  if (extension === 'jpeg') {
    return 'jpg';
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

export function isSupabaseProfileImageUrl(uri?: string) {
  return Boolean(uri?.includes('/storage/v1/object/public/profile-images/'));
}

export async function uploadProfileImage(userId: string, imageUri: string) {
  const extension = getFileExtension(imageUri);
  const contentType = getContentType(extension);

  const response = await fetch(imageUri);

  if (!response.ok) {
    throw new Error('No se pudo leer la imagen seleccionada.');
  }

  const arrayBuffer = await response.arrayBuffer();

  const fileName = `avatar-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.path) {
    throw new Error('La imagen no se ha subido correctamente.');
  }

  const publicUrlResult = supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlResult.data.publicUrl;
}