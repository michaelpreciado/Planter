/**
 * Enhanced image storage utilities for better memory management and storage optimization
 */

// Storage keys
const STORAGE_KEYS = {
  IMAGES: 'planter_images',
  METADATA: 'planter_image_metadata',
} as const;

// Image metadata interface
interface ImageMetadata {
  id: string;
  size: number;
  created: number;
  lastAccessed: number;
  plantId?: string;
  noteId?: string;
}

// Storage configuration
const STORAGE_CONFIG = {
  MAX_IMAGES: 50, // Maximum number of images to store
  MAX_TOTAL_SIZE: 10 * 1024 * 1024, // 10MB total storage limit
  CLEANUP_THRESHOLD: 0.8, // Clean up when 80% full
  MAX_AGE_DAYS: 30, // Remove images older than 30 days
} as const;

class ImageStorageManager {
  private images: Map<string, string> = new Map();
  private metadata: Map<string, ImageMetadata> = new Map();
  private initialized = false;

  /**
   * Initialize the storage manager
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load existing images and metadata
      const savedImages = localStorage.getItem(STORAGE_KEYS.IMAGES);
      const savedMetadata = localStorage.getItem(STORAGE_KEYS.METADATA);

      if (savedImages) {
        const parsedImages = JSON.parse(savedImages);
        this.images = new Map(Object.entries(parsedImages));
      }

      if (savedMetadata) {
        const parsedMetadata = JSON.parse(savedMetadata);
        this.metadata = new Map(
          Object.entries(parsedMetadata).map(([key, value]) => [key, value as ImageMetadata])
        );
      }

      // Clean up old or excess images
      await this.cleanup();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize image storage:', error);
      // Reset storage on error
      this.images.clear();
      this.metadata.clear();
      this.initialized = true;
    }
  }

  /**
   * Store an image with automatic cleanup
   */
  async storeImage(imageData: string, plantId?: string, noteId?: string): Promise<string> {
    await this.init();

    const id = this.generateId();
    const size = this.calculateSize(imageData);

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

      // Save to localStorage
      await this.persist();

      return id;
    } catch (error) {
      console.error('Failed to store image:', error);
      throw new Error('Failed to store image. Storage may be full.');
    }
  }

  /**
   * Retrieve an image by ID
   */
  async getImage(id: string): Promise<string | null> {
    await this.init();

    const imageData = this.images.get(id);
    if (!imageData) return null;

    // Update last accessed time
    const metadata = this.metadata.get(id);
    if (metadata) {
      metadata.lastAccessed = Date.now();
      this.metadata.set(id, metadata);
    }

    return imageData;
  }

  /**
   * Remove an image by ID
   */
  async removeImage(id: string): Promise<void> {
    await this.init();

    this.images.delete(id);
    this.metadata.delete(id);
    await this.persist();
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
  getStorageStats(): {
    totalImages: number;
    totalSize: number;
    maxSize: number;
    usagePercentage: number;
  } {
    const totalSize = this.getTotalSize();
    return {
      totalImages: this.images.size,
      totalSize,
      maxSize: STORAGE_CONFIG.MAX_TOTAL_SIZE,
      usagePercentage: (totalSize / STORAGE_CONFIG.MAX_TOTAL_SIZE) * 100,
    };
  }

  /**
   * Force cleanup of old images
   */
  async cleanup(force = false): Promise<void> {
    const totalSize = this.getTotalSize();
    const needsCleanup = force || 
      totalSize > STORAGE_CONFIG.MAX_TOTAL_SIZE * STORAGE_CONFIG.CLEANUP_THRESHOLD ||
      this.images.size >= STORAGE_CONFIG.MAX_IMAGES;

    if (!needsCleanup) return;

    const now = Date.now();
    const maxAge = STORAGE_CONFIG.MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const imagesToRemove: string[] = [];

    // First, remove images older than max age
    for (const [id, metadata] of this.metadata.entries()) {
      if (now - metadata.created > maxAge) {
        imagesToRemove.push(id);
      }
    }

    // If still need more space, remove least recently accessed
    if (imagesToRemove.length === 0 || force) {
      const sortedByAccess = Array.from(this.metadata.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      const removeCount = Math.max(1, Math.floor(this.images.size * 0.2)); // Remove 20%
      for (let i = 0; i < removeCount && i < sortedByAccess.length; i++) {
        imagesToRemove.push(sortedByAccess[i][0]);
      }
    }

    // Remove the images
    for (const id of imagesToRemove) {
      this.images.delete(id);
      this.metadata.delete(id);
    }

    if (imagesToRemove.length > 0) {
      console.log(`Cleaned up ${imagesToRemove.length} images from storage`);
      await this.persist();
    }
  }

  /**
   * Clear all stored images
   */
  async clearAll(): Promise<void> {
    this.images.clear();
    this.metadata.clear();
    
    try {
      localStorage.removeItem(STORAGE_KEYS.IMAGES);
      localStorage.removeItem(STORAGE_KEYS.METADATA);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  // Private methods

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSize(imageData: string): number {
    // Approximate size in bytes (base64 is about 4/3 the size of original)
    return imageData.length * 0.75;
  }

  private getTotalSize(): number {
    let total = 0;
    for (const metadata of this.metadata.values()) {
      total += metadata.size;
    }
    return total;
  }

  private async persist(): Promise<void> {
    try {
      const imagesObj = Object.fromEntries(this.images.entries());
      const metadataObj = Object.fromEntries(this.metadata.entries());

      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(imagesObj));
      localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(metadataObj));
    } catch (error) {
      console.error('Failed to persist images to storage:', error);
      
      // If storage is full, try emergency cleanup
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        await this.cleanup(true);
        throw new Error('Storage quota exceeded. Some images may have been removed.');
      }
      
      throw error;
    }
  }
}

// Create singleton instance
export const imageStorage = new ImageStorageManager();

// Helper functions for easy use
export const storeImage = (imageData: string, plantId?: string, noteId?: string) => 
  imageStorage.storeImage(imageData, plantId, noteId);

export const getImage = (id: string) => 
  imageStorage.getImage(id);

export const removeImage = (id: string) => 
  imageStorage.removeImage(id);

export const getPlantImages = (plantId: string) => 
  imageStorage.getPlantImages(plantId);

export const removePlantImages = (plantId: string) => 
  imageStorage.removePlantImages(plantId);

export const getStorageStats = () => 
  imageStorage.getStorageStats();

export const clearAllImages = () => 
  imageStorage.clearAll(); 