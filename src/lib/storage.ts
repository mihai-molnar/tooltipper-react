import { supabase } from './supabase-client';

const BUCKET_NAME = 'photos';
const MAX_FILE_SIZE = 5242880; // 5MB

export const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export async function validateImageFile(file: File): Promise<void> {
  if (!file.type.startsWith('image/')) {
    throw new StorageError('Please upload an image file');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new StorageError('File size must be less than 5MB');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!fileExt || !validImageExtensions.includes(fileExt as any)) {
    throw new StorageError('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
  }
}