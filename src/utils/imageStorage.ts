/**
 * Enhanced image storage utilities for better memory management and storage optimization
 */

export interface ImageMetadata {
  id: string;
  size: number;
  created: number;
  lastAccessed: number;
  plantId?: string;
  noteId?: string;
}

// Storage keys
const STORAGE_KEYS = {
  IMAGES: 'plant-app-images',
  METADATA: 'plant-app-image-metadata',
} as const;

// Storage configuration
const STORAGE_CONFIG = {
  MAX_IMAGES: 50, // Maximum number of images to store
  MAX_TOTAL_SIZE: 10 * 1024 * 1024, // 10MB total storage limit
  CLEANUP_THRESHOLD: 0.8, // Clean up when 80% full
  MAX_AGE_DAYS: 30, // Remove images older than 30 days
} as const;

class ImageStorageManager {
  private images: Map<string, string> = new Map();
  public metadata: Map<string, ImageMetadata> = new Map();
  public initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the storage manager with better error handling
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    
    // Prevent multiple initialization attempts
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._performInit();
    return this.initPromise;
  }

  private async _performInit(): Promise<void> {
    try {
      // Check if localStorage is available (for SSR/deployment compatibility)
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available, image storage disabled');
        this.initialized = true;
        return;
      }

      // Load existing images and metadata with error handling
      await this._loadStoredData();
      
      // Clean up old or excess images
      await this.cleanup();
      
      this.initialized = true;
      console.log('Image storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize image storage:', error);
      // Reset storage on error to prevent corruption
      this._resetStorage();
      this.initialized = true;
    }
  }

  private async _loadStoredData(): Promise<void> {
    try {
      const savedImages = localStorage.getItem(STORAGE_KEYS.IMAGES);
      const savedMetadata = localStorage.getItem(STORAGE_KEYS.METADATA);

      if (savedImages) {
        const parsedImages = JSON.parse(savedImages);
        if (typeof parsedImages === 'object' && parsedImages !== null) {
          this.images = new Map(Object.entries(parsedImages));
        }
      }

      if (savedMetadata) {
        const parsedMetadata = JSON.parse(savedMetadata);
        if (typeof parsedMetadata === 'object' && parsedMetadata !== null) {
          this.metadata = new Map(
            Object.entries(parsedMetadata).map(([key, value]) => [key, value as ImageMetadata])
          );
        }
      }

      // Validate data consistency
      this._validateStorageConsistency();
    } catch (error) {
      console.error('Failed to load stored data:', error);
      throw error;
    }
  }

  private _validateStorageConsistency(): void {
    // Remove metadata for images that don't exist
    const imageIds = new Set(this.images.keys());
    const metadataIds = new Set(this.metadata.keys());
    
    for (const metadataId of metadataIds) {
      if (!imageIds.has(metadataId)) {
        this.metadata.delete(metadataId);
      }
    }

    // Remove images that don't have metadata
    for (const imageId of imageIds) {
      if (!metadataIds.has(imageId)) {
        this.images.delete(imageId);
      }
    }
  }

  private _resetStorage(): void {
    this.images.clear();
    this.metadata.clear();
    try {
      localStorage.removeItem(STORAGE_KEYS.IMAGES);
      localStorage.removeItem(STORAGE_KEYS.METADATA);
    } catch (error) {
      console.error('Failed to reset storage:', error);
    }
  }

  /**
   * Store an image with automatic cleanup and better error handling
   */
  async storeImage(imageData: string, plantId?: string, noteId?: string): Promise<string> {
    await this.init();

    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('Storage not available');
    }

    const id = this.generateId();
    const size = this.calculateSize(imageData);

    // Validate image data
    if (!this._isValidImageData(imageData)) {
      throw new Error('Invalid image data format');
    }

    try {
      // Check if we need to clean up before storing
      const totalSize = this.getTotalSize() + size;
      if (totalSize > STORAGE_CONFIG.MAX_TOTAL_SIZE || 
          this.images.size >= STORAGE_CONFIG.MAX_IMAGES) {
        await this.cleanup(true);
      }

      // Store the image
      this.images.set(id, imageData);
      this.metadata.set(id, {
        id,
        size,
        created: Date.now(),
        lastAccessed: Date.now(),
        plantId,
        noteId,
      });

      // Save to localStorage with retry logic
      await this._persistWithRetry();

      return id;
    } catch (error) {
      // Clean up if storing failed
      this.images.delete(id);
      this.metadata.delete(id);
      
      console.error('Failed to store image:', error);
      throw new Error('Failed to store image. Storage may be full or unavailable.');
    }
  }

  /**
   * Get an image by ID with better error handling
   */
  async getImage(id: string): Promise<string | null> {
    await this.init();

    if (!id || typeof id !== 'string') {
      return null;
    }

    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage not available, cannot retrieve image');
      return null;
    }

    try {
      const imageData = this.images.get(id);
      if (!imageData) {
        // Try to reload from localStorage in case of memory loss
        await this._loadStoredData();
        const reloadedData = this.images.get(id);
        if (!reloadedData) {
          return null;
        }
        return reloadedData;
      }

      // Update last accessed time
      const metadata = this.metadata.get(id);
      if (metadata) {
        metadata.lastAccessed = Date.now();
        this.metadata.set(id, metadata);
        // Persist updated metadata asynchronously
        this._persistWithRetry().catch(error => {
          console.warn('Failed to update access time:', error);
        });
      }

      return imageData;
    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  }

  /**
   * Remove an image by ID
   */
  async removeImage(id: string): Promise<void> {
    await this.init();

    if (!id || typeof id !== 'string') {
      return;
    }

    try {
      this.images.delete(id);
      this.metadata.delete(id);
      await this._persistWithRetry();
    } catch (error) {
      console.error('Failed to remove image:', error);
      throw error;
    }
  }

  /**
   * Get all images for a specific plant
   */
  async getPlantImages(plantId: string): Promise<Array<{ id: string; data: string }>> {
    await this.init();

    const plantImages: Array<{ id: string; data: string }> = [];

    for (const [id, metadata] of this.metadata.entries()) {
      if (metadata.plantId === plantId) {
        const imageData = this.images.get(id);
        if (imageData) {
          plantImages.push({ id, data: imageData });
          // Update access time
          metadata.lastAccessed = Date.now();
        }
      }
    }

    return plantImages;
  }

  /**
   * Update image metadata to associate with a plant
   */
  async updateImagePlantId(imageId: string, plantId: string): Promise<void> {
    await this.init();

    const metadata = this.metadata.get(imageId);
    if (metadata) {
      metadata.plantId = plantId;
      this.metadata.set(imageId, metadata);
      await this.persist();
    }
  }

  /**
   * Remove all images for a plant
   */
  async removePlantImages(plantId: string): Promise<void> {
    await this.init();

    const imagesToRemove: string[] = [];
    
    for (const [id, metadata] of this.metadata.entries()) {
      if (metadata.plantId === plantId) {
        imagesToRemove.push(id);
      }
    }

    for (const id of imagesToRemove) {
      this.images.delete(id);
      this.metadata.delete(id);
    }

    await this.persist();
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    totalImages: number;
    totalSize: number;
    usagePercentage: number;
    available: boolean;
  } {
    const available = typeof window !== 'undefined' && !!window.localStorage;
    
    if (!available || !this.initialized) {
      return {
        totalImages: 0,
        totalSize: 0,
        usagePercentage: 0,
        available,
      };
    }

    const totalSize = this.getTotalSize();
    return {
      totalImages: this.images.size,
      totalSize,
      usagePercentage: (totalSize / STORAGE_CONFIG.MAX_TOTAL_SIZE) * 100,
      available,
    };
  }

  /**
   * Debug: Get all image metadata
   */
  getAllImageMetadata(): Array<ImageMetadata> {
    return Array.from(this.metadata.values());
  }

  /**
   * Debug: Check if an image exists
   */
  async imageExists(imageId: string): Promise<boolean> {
    await this.init();
    return this.images.has(imageId);
  }

  /**
   * Clean up old or excess images
   */
  async cleanup(force = false): Promise<void> {
    await this.init();

    try {
      const totalSize = this.getTotalSize();
      const shouldCleanup = force || 
        totalSize > STORAGE_CONFIG.MAX_TOTAL_SIZE * STORAGE_CONFIG.CLEANUP_THRESHOLD ||
        this.images.size > STORAGE_CONFIG.MAX_IMAGES * STORAGE_CONFIG.CLEANUP_THRESHOLD;

      if (!shouldCleanup) {
        return;
      }

      const now = Date.now();
      const maxAge = STORAGE_CONFIG.MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
      const metadataArray = Array.from(this.metadata.values());

      // Remove old images first
      const oldImages = metadataArray.filter(meta => now - meta.created > maxAge);
      for (const meta of oldImages) {
        this.images.delete(meta.id);
        this.metadata.delete(meta.id);
      }

      // If still over limits, remove least recently used images
      if (this.images.size > STORAGE_CONFIG.MAX_IMAGES || 
          this.getTotalSize() > STORAGE_CONFIG.MAX_TOTAL_SIZE) {
        const sortedByAccess = metadataArray
          .filter(meta => this.images.has(meta.id)) // Only existing images
          .sort((a, b) => a.lastAccessed - b.lastAccessed);

        const targetSize = Math.floor(STORAGE_CONFIG.MAX_IMAGES * 0.7);
        const toRemove = sortedByAccess.slice(0, sortedByAccess.length - targetSize);

        for (const meta of toRemove) {
          this.images.delete(meta.id);
          this.metadata.delete(meta.id);
        }
      }

      await this._persistWithRetry();
      console.log(`Cleanup completed. Images: ${this.images.size}, Size: ${this.getTotalSize()} bytes`);
    } catch (error) {
      console.error('Failed to cleanup images:', error);
    }
  }

  /**
   * Clear all stored images (for debugging/reset)
   */
  async clearAll(): Promise<void> {
    await this.init();
    
    try {
      this.images.clear();
      this.metadata.clear();
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEYS.IMAGES);
        localStorage.removeItem(STORAGE_KEYS.METADATA);
      }
    } catch (error) {
      console.error('Failed to clear all images:', error);
      throw error;
    }
  }

  // Private helper methods
  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSize(imageData: string): number {
    // Rough estimate: base64 is ~33% larger than binary
    return Math.ceil(imageData.length * 0.75);
  }

  private _isValidImageData(imageData: string): boolean {
    return typeof imageData === 'string' && 
           imageData.startsWith('data:image/') && 
           imageData.length > 100; // Minimum reasonable size
  }

  private getTotalSize(): number {
    return Array.from(this.metadata.values()).reduce((total, meta) => total + meta.size, 0);
  }

  private async _persistWithRetry(maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.persist();
        return;
      } catch (error) {
        console.error(`Persistence attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }

  public async persist(): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage not available');
    }

    try {
      const imagesObj = Object.fromEntries(this.images.entries());
      const metadataObj = Object.fromEntries(this.metadata.entries());

      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(imagesObj));
      localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(metadataObj));
    } catch (error) {
      console.error('Failed to persist images to storage:', error);
      
      // If storage is full, try emergency cleanup
      if (error instanceof Error && (
        error.name === 'QuotaExceededError' || 
        error.message.includes('quota') ||
        error.message.includes('storage')
      )) {
        await this.cleanup(true);
        throw new Error('Storage quota exceeded. Some images may have been removed.');
      }
      
      throw error;
    }
  }

  /**
   * Debug utility to diagnose image loading issues
   */
  async debugImageSystem(): Promise<void> {
    console.log('=== Image Storage Debug ===');
    console.log('Initialized:', this.initialized);
    console.log('Window available:', typeof window !== 'undefined');
    console.log('LocalStorage available:', typeof window !== 'undefined' && !!window.localStorage);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('Total images in memory:', this.images.size);
      console.log('Total metadata entries:', this.metadata.size);
      
      const stats = this.getStats();
      console.log('Storage stats:', stats);
      
      // Check for corrupted data
      let corruptedImages = 0;
      for (const [id, data] of this.images.entries()) {
        if (!data.startsWith('data:image/')) {
          console.warn(`Corrupted image data for ID: ${id}`);
          corruptedImages++;
        }
      }
      console.log('Corrupted images found:', corruptedImages);
      
      // Check metadata consistency
      const imageIds = new Set(this.images.keys());
      const metadataIds = new Set(this.metadata.keys());
      const orphanedImages = [...imageIds].filter(id => !metadataIds.has(id));
      const orphanedMetadata = [...metadataIds].filter(id => !imageIds.has(id));
      
      console.log('Orphaned images (no metadata):', orphanedImages);
      console.log('Orphaned metadata (no image):', orphanedMetadata);
    }
    
    console.log('=========================');
  }
}

// Export singleton instance
export const imageStorageManager = new ImageStorageManager();

// Convenience functions
export const storeImage = (imageData: string, plantId?: string, noteId?: string) => 
  imageStorageManager.storeImage(imageData, plantId, noteId);

export const getImage = (id: string) => 
  imageStorageManager.getImage(id);

export const removeImage = (id: string) => 
  imageStorageManager.removeImage(id);

export const getStorageStats = () => 
  imageStorageManager.getStats();

export const clearAllImages = () => 
  imageStorageManager.clearAll();

// Helper functions for plant store integration
export const getAllImageMetadata = (): ImageMetadata[] => {
  if (!imageStorageManager.initialized) {
    return [];
  }
  return Array.from(imageStorageManager.metadata.values());
};

export const imageExists = async (imageId: string): Promise<boolean> => {
  if (!imageId) return false;
  const image = await getImage(imageId);
  return image !== null;
};

export const updateImagePlantId = async (imageId: string, plantId: string): Promise<void> => {
  await imageStorageManager.init();
  const metadata = imageStorageManager.metadata.get(imageId);
  if (metadata) {
    metadata.plantId = plantId;
    imageStorageManager.metadata.set(imageId, metadata);
    await imageStorageManager.persist();
  }
};

export const removePlantImages = async (plantId: string): Promise<void> => {
  await imageStorageManager.init();
  const toRemove = Array.from(imageStorageManager.metadata.values())
    .filter(meta => meta.plantId === plantId)
    .map(meta => meta.id);
  
  for (const imageId of toRemove) {
    await removeImage(imageId);
  }
};

export const debugImageSystem = async (): Promise<void> => {
  await imageStorageManager.debugImageSystem();
}; 