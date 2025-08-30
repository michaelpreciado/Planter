/**
 * Modern Image Storage System v2.0
 * Uses Supabase Storage for cloud sync with IndexedDB/localStorage fallback
 */

import { supabase, isSupabaseConfigured } from './supabase';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';

export interface ImageMetadata {
  id: string;
  size: number;
  created: number;
  lastAccessed: number;
  plantId?: string;
  noteId?: string;
  mimeType: string;
  width?: number;
  height?: number;
  supabaseUrl?: string; // Cloud URL if synced
  isCloudSynced?: boolean;
}

export interface StoredImage {
  id: string;
  data: string;
  metadata: ImageMetadata;
}

class ModernImageStorage {
  private dbName = 'PlantAppImages';
  private dbVersion = 2; // Increment version for new cloud sync features
  private storeName = 'images';
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private supabaseBucket = 'plant-images';

  /**
   * Initialize IndexedDB with proper error handling
   */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        console.warn('IndexedDB not available (SSR)');
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error);
        resolve(); // Don't reject, fall back to localStorage
      };

      request.onsuccess = () => {
        this.db = request.result;
        // IndexedDB initialized
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Create object store for images
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('plantId', 'plantId', { unique: false });
          store.createIndex('created', 'created', { unique: false });
          store.createIndex('isCloudSynced', 'isCloudSynced', { unique: false });
        } else {
          // Update existing store for v2 features
          const transaction = request.transaction!;
          const store = transaction.objectStore(this.storeName);
          
          // Add new indexes if they don't exist
          if (!store.indexNames.contains('isCloudSynced')) {
            store.createIndex('isCloudSynced', 'isCloudSynced', { unique: false });
          }
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Store image with automatic cloud sync if available
   */
  async storeImage(imageData: string, plantId?: string, noteId?: string): Promise<string> {
    await this.init();

    const id = this.generateId();
    const metadata = this.createMetadata(id, imageData, plantId, noteId);
    
    try {
      // Try cloud storage first if configured
      if (isSupabaseConfigured()) {
        try {
          const cloudUrl = await this.uploadToSupabase(id, imageData);
          metadata.supabaseUrl = cloudUrl;
          metadata.isCloudSynced = true;
          // Uploaded to cloud
        } catch (cloudError) {
          // Cloud upload failed, using local storage
          metadata.isCloudSynced = false;
        }
      } else {
        metadata.isCloudSynced = false;
      }

      // Always store locally for offline access
      if (this.db) {
        await this.storeInIndexedDB(id, imageData, metadata);
        // Stored in IndexedDB
      } else {
        await this.storeInLocalStorage(id, imageData, metadata);
                  // Stored in localStorage
      }
      
      return id;
      
    } catch (error) {
      // Failed to store image
      throw new Error('Failed to store image. Storage may be full.');
    }
  }

  /**
   * Retrieve image by ID - try cloud first, then local
   */
  async getImage(id: string): Promise<string | null> {
    if (!id) {
      console.log('📦 ImageStorage: No ID provided');
      return null;
    }
    
    console.log('📦 ImageStorage: Getting image with ID:', id);
    await this.init();

    try {
      // Try local storage first for better performance
      let imageData: string | null = null;
      let metadata: ImageMetadata | null = null;

      if (this.db) {
        console.log('📦 ImageStorage: Checking IndexedDB for image:', id);
        const localImage = await this.getFromIndexedDB(id);
        if (localImage) {
          imageData = localImage.data;
          metadata = localImage.metadata;
          // Found in IndexedDB
        } else {
          // Not in IndexedDB
        }
      } else {
        // Checking localStorage
        imageData = this.getFromLocalStorage(id);
        metadata = this.getMetadataFromLocalStorage(id);
        if (imageData) {
          // Found in localStorage
        } else {
          // Not in localStorage
        }
      }

      // If we have local data, use it
      if (imageData) {
        // Returning local data
        await this.updateLastAccessed(id);
        return imageData;
      }

      // If no local data but we have cloud URL, try to fetch from cloud
      if (metadata?.supabaseUrl && isSupabaseConfigured()) {
        // Attempting cloud fetch
        try {
          const cloudData = await this.downloadFromSupabase(metadata.supabaseUrl);
          if (cloudData) {
                          // Downloaded from cloud
            // Cache it locally for next time
            await this.storeImage(cloudData, metadata.plantId, metadata.noteId);
            return cloudData;
          } else {
                          // Cloud download failed (no data)
          }
        } catch (cloudError) {
                      // Cloud fetch failed
        }
      } else if (metadata?.supabaseUrl && !isSupabaseConfigured()) {
                  // Cloud URL exists but Supabase not configured
      } else if (!metadata?.supabaseUrl) {
                  // No cloud URL
      }

              // Image not found
      return null;
      
    } catch (error) {
      // Failed to retrieve image
      return null;
    }
  }

  /**
   * Remove image from both local and cloud storage
   */
  async removeImage(id: string): Promise<void> {
    if (!id) return;
    
    await this.init();

    try {
      // Get metadata first to check if we need to clean up cloud storage
      let metadata: ImageMetadata | null = null;
      
      if (this.db) {
        const image = await this.getFromIndexedDB(id);
        metadata = image?.metadata || null;
        await this.removeFromIndexedDB(id);
      } else {
        metadata = this.getMetadataFromLocalStorage(id);
        this.removeFromLocalStorage(id);
      }

      // Remove from cloud storage if it exists there
      if (metadata?.supabaseUrl && isSupabaseConfigured()) {
        try {
          await this.removeFromSupabase(id);
          // Removed from cloud
        } catch (cloudError) {
          // Failed to remove from cloud
        }
      }
    } catch (error) {
      // Failed to remove image
    }
  }

  /**
   * Sync local images to cloud storage
   */
  async syncToCloud(): Promise<{ uploaded: number; errors: number }> {
    if (!isSupabaseConfigured()) {
      // Cloud storage not configured
      return { uploaded: 0, errors: 0 };
    }

    await this.init();

    let uploaded = 0;
    let errors = 0;

    try {
      // Get all images that aren't cloud synced
      const unSyncedImages = await this.getUnSyncedImages();
      
      for (const image of unSyncedImages) {
        try {
          const cloudUrl = await this.uploadToSupabase(image.id, image.data);
          
          // Update metadata
          image.metadata.supabaseUrl = cloudUrl;
          image.metadata.isCloudSynced = true;
          
          // Update in storage
          if (this.db) {
            await this.storeInIndexedDB(image.id, image.data, image.metadata);
          } else {
            await this.storeInLocalStorage(image.id, image.data, image.metadata);
          }
          
          uploaded++;
          // Synced to cloud
        } catch (error) {
          // Failed to sync to cloud
          errors++;
        }
      }
    } catch (error) {
      // Failed to sync images
      errors++;
    }

    return { uploaded, errors };
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalImages: number;
    totalSize: number;
    cloudSynced: number;
    storageType: 'indexeddb' | 'localstorage' | 'unavailable';
  }> {
    await this.init();

    try {
      if (this.db) {
        const stats = await this.getIndexedDBStats();
        return { ...stats, storageType: 'indexeddb' };
      }
      
      const stats = this.getLocalStorageStats();
      return { ...stats, storageType: 'localstorage' };
      
    } catch (error) {
      return { totalImages: 0, totalSize: 0, cloudSynced: 0, storageType: 'unavailable' };
    }
  }

  /**
   * Clean up old images
   */
  async cleanup(): Promise<void> {
    await this.init();
    
    try {
      if (this.db) {
        await this.cleanupIndexedDB();
      } else {
        this.cleanupLocalStorage();
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  // Private Supabase methods
  private async uploadToSupabase(id: string, imageData: string): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Convert data URL to blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    const fileName = `${user.id}/${id}.${blob.type.split('/')[1] || 'jpg'}`;
    
    const { data, error } = await supabase.storage
      .from(this.supabaseBucket)
      .upload(fileName, blob, {
        upsert: true,
        contentType: blob.type
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(this.supabaseBucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  private async downloadFromSupabase(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to download from Supabase:', error);
      return null;
    }
  }

  private async removeFromSupabase(id: string): Promise<void> {
    if (!supabase) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Try different file extensions
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    for (const ext of extensions) {
      const fileName = `${user.id}/${id}.${ext}`;
      try {
        await supabase.storage.from(this.supabaseBucket).remove([fileName]);
      } catch (error) {
        // Ignore errors for non-existent files
      }
    }
  }

  private async getUnSyncedImages(): Promise<StoredImage[]> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('isCloudSynced');
        
        const request = index.getAll(IDBKeyRange.only(false)); // Get all unsynced images
        
        request.onsuccess = () => {
          const results = request.result.map(item => ({
            id: item.id,
            data: item.data,
            metadata: item
          }));
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } else {
      // LocalStorage implementation
      const images: StoredImage[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('img_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              if (!parsed.metadata.isCloudSynced) {
                images.push({
                  id: parsed.metadata.id,
                  data: parsed.data,
                  metadata: parsed.metadata
                });
              }
            }
          } catch (error) {
            console.warn('Failed to parse localStorage item:', error);
          }
        }
      }
      return images;
    }
  }

  // Enhanced private methods for cloud sync
  private async getIndexedDBStats(): Promise<{ totalImages: number; totalSize: number; cloudSynced: number }> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result;
        const totalImages = results.length;
        const totalSize = results.reduce((sum, item) => sum + (item.size || 0), 0);
        const cloudSynced = results.filter(item => item.isCloudSynced).length;
        resolve({ totalImages, totalSize, cloudSynced });
      };
      request.onerror = () => reject(request.error);
    });
  }

  private getLocalStorageStats(): { totalImages: number; totalSize: number; cloudSynced: number } {
    let totalImages = 0;
    let totalSize = 0;
    let cloudSynced = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('img_')) {
        totalImages++;
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
          try {
            const parsed = JSON.parse(item);
            if (parsed.metadata.isCloudSynced) {
              cloudSynced++;
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }
      }
    }

    return { totalImages, totalSize, cloudSynced };
  }

  private getMetadataFromLocalStorage(id: string): ImageMetadata | null {
    try {
      const key = `img_${id}`;
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed.metadata;
      }
    } catch (error) {
      console.error('Failed to parse localStorage metadata:', error);
    }
    return null;
  }

  // Private IndexedDB methods
  private async storeInIndexedDB(id: string, data: string, metadata: ImageMetadata): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.put({ ...metadata, id, data });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromIndexedDB(id: string): Promise<StoredImage | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? { id: result.id, data: result.data, metadata: result } : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async removeFromIndexedDB(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async cleanupIndexedDB(): Promise<void> {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('created');
      
      const request = index.openCursor();
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const item = cursor.value;
          if (now - item.created > maxAge) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async updateLastAccessed(id: string): Promise<void> {
    if (!this.db) return;

    try {
      const image = await this.getFromIndexedDB(id);
      if (image) {
        image.metadata.lastAccessed = Date.now();
        await this.storeInIndexedDB(id, image.data, image.metadata);
      }
    } catch (error) {
      // Non-critical operation, just log
      console.warn('Failed to update last accessed time:', error);
    }
  }

  // Private localStorage fallback methods
  private async storeInLocalStorage(id: string, data: string, metadata: ImageMetadata): Promise<void> {
    const key = `img_${id}`;
    const item = { data, metadata };
    localStorage.setItem(key, JSON.stringify(item));
  }

  private getFromLocalStorage(id: string): string | null {
    try {
      const key = `img_${id}`;
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed.data;
      }
    } catch (error) {
      console.error('Failed to parse localStorage item:', error);
    }
    return null;
  }

  private removeFromLocalStorage(id: string): void {
    const key = `img_${id}`;
    localStorage.removeItem(key);
  }

  private cleanupLocalStorage(): void {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('img_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (now - parsed.metadata.created > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    }
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createMetadata(id: string, imageData: string, plantId?: string, noteId?: string): ImageMetadata {
    const now = Date.now();
    return {
      id,
      size: new Blob([imageData]).size,
      created: now,
      lastAccessed: now,
      plantId,
      noteId,
      mimeType: this.extractMimeType(imageData),
      isCloudSynced: false, // Will be updated after successful cloud upload
    };
  }

  private extractMimeType(dataUrl: string): string {
    const match = dataUrl.match(/data:([^;]+);/);
    return match ? match[1] : 'image/jpeg';
  }
}

// Export singleton instance
export const imageStorage = new ModernImageStorage();

// Export convenient functions
export const storeImage = (imageData: string, plantId?: string, noteId?: string) => 
  imageStorage.storeImage(imageData, plantId, noteId);

export const getImage = (id: string) => 
  imageStorage.getImage(id);

export const removeImage = (id: string) => 
  imageStorage.removeImage(id);

export const getStorageStats = () => 
  imageStorage.getStats();

export const cleanupImages = () => 
  imageStorage.cleanup();

export const syncImagesToCloud = () => 
  imageStorage.syncToCloud();

// ----------------------------
// New Supabase upload helpers
// ----------------------------

/**
 * Compresses & uploads a user image to the private `plant-images` Supabase bucket.
 * Automatically stores DB linkage in `images` table (if present).
 * Returns the storage path as well as a freshly-minted signed URL.
 */
export async function uploadPlantImage(
  file: File,
  plantId: string,
  userId: string
): Promise<{ path: string; width: number; height: number; mimeType: string; signedUrl: string }> {
  if (!supabase) throw new Error('Supabase not configured');
  if (!file) throw new Error('No file provided');
  if (!plantId || !userId) throw new Error('plantId & userId are required');

  // 1. Compress + orientation-safe transform (max 2 MB / 2048px)
  const compressed = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: file.type.startsWith('image/') ? file.type : undefined,
  });

  // 2. Derive dimensions from compressed blob
  const bitmap = await createImageBitmap(compressed);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close(); // free memory

  // 3. Build storage path → userId/plantId/uuid.ext
  const ext = compressed.type.split('/')[1] || 'jpg';
  const path = `${userId}/${plantId}/${uuidv4()}.${ext}`;

  // 4. Upload to Supabase Storage (private bucket)
  const { error: uploadError } = await supabase.storage
    .from('plant-images')
    .upload(path, compressed, {
      contentType: compressed.type,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  // 5. Create signed URL (24h default)
  const signedUrl = await getSignedImageUrl(path);

  // 6. Upsert DB linkage if table exists (ignore error silently)
  try {
    await supabase.from('images').upsert({
      plant_id: plantId,
      user_id: userId,
      storage_path: path,
      width,
      height,
      mime_type: compressed.type,
    });
  } catch {
    /* table might not exist – ignore */
  }

  return {
    path,
    width,
    height,
    mimeType: compressed.type,
    signedUrl,
  };
}

/**
 * Generates (or refreshes) a signed URL for an object in `plant-images` bucket.
 * @param path  Object path within the bucket
 * @param expiresIn  Expiry in seconds (default 24 h)
 */
export async function getSignedImageUrl(path: string, expiresIn = 60 * 60 * 24): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase.storage
    .from('plant-images')
    .createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    throw error || new Error('Could not generate signed URL');
  }
  return data.signedUrl;
}

// Debug functions removed for production 