import { supabase } from './supabase-client';
import { validateImageFile } from './storage';
import type { Photo } from '../types';

const BUCKET_NAME = 'photos';

export async function uploadImage(file: File): Promise<string | null> {
  try {
    await validateImageFile(file);

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function createPhoto(imageUrl: string, shortId: string): Promise<Photo | null> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .insert([{ image_url: imageUrl, short_id: shortId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating photo:', error);
    return null;
  }
}