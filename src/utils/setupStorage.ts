/**
 * Supabase Storage Setup Utility
 * This script helps set up the required storage bucket for image sync
 */

import { supabase, isSupabaseConfigured } from './supabase';

export async function setupImageStorage(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    };
  }

  try {
    const bucketName = 'plant-images';
    
    // Check if bucket already exists
    if (!supabase) throw new Error('Supabase not configured');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Failed to list buckets:', listError);
      return {
        success: false,
        message: `Failed to list buckets: ${listError.message}`
      };
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log('✅ Storage bucket already exists');
      return {
        success: true,
        message: 'Storage bucket already exists and is ready for use.'
      };
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      console.error('Failed to create bucket:', error);
      return {
        success: false,
        message: `Failed to create storage bucket: ${error.message}`
      };
    }

    console.log('✅ Storage bucket created successfully');
    return {
      success: true,
      message: 'Storage bucket created successfully! Image sync across devices is now enabled.'
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Setup failed:', error);
    return {
      success: false,
      message: `Setup failed: ${message}`
    };
  }
}

export async function checkStoragePermissions(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: 'Supabase not configured'
    };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    // Try to upload a test file
    const testData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const response = await fetch(testData);
    const blob = await response.blob();
    
    const testFileName = `${user.id}/test_${Date.now()}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('plant-images')
      .upload(testFileName, blob);

    if (uploadError) {
      return {
        success: false,
        message: `Upload test failed: ${uploadError.message}`
      };
    }

    // Clean up test file
    await supabase.storage
      .from('plant-images')
      .remove([testFileName]);

    return {
      success: true,
      message: 'Storage permissions are working correctly'
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Permission test failed: ${message}`
    };
  }
} 