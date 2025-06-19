/**
 * Modern Image Storage System
 * Uses IndexedDB for efficient binary storage with fallback to localStorage
 */

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
}

export interface StoredImage {
  id: string;
  data: string;
  metadata: ImageMetadata;
}

class ModernImageStorage {
  private dbName = 'PlantAppImages';
  private dbVersion = 1;
  private storeName = 'images';
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

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
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Create object store for images
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('plantId', 'plantId', { unique: false });
          store.createIndex('created', 'created', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Store image with automatic optimization
   */
  async storeImage(imageData: string, plantId?: string, noteId?: string): Promise<string> {
    await this.init();

    const id = this.generateId();
    const metadata = this.createMetadata(id, imageData, plantId, noteId);
    
    try {
      // Try IndexedDB first
      if (this.db) {
        await this.storeInIndexedDB(id, imageData, metadata);
        console.log('✅ Image stored in IndexedDB:', id);
        return id;
      }
      
      // Fallback to localStorage
      await this.storeInLocalStorage(id, imageData, metadata);
      console.log('✅ Image stored in localStorage:', id);
      return id;
      
    } catch (error) {
      console.error('❌ Failed to store image:', error);
      throw new Error('Failed to store image. Storage may be full.');
    }
  }

  /**
   * Retrieve image by ID
   */
  async getImage(id: string): Promise<string | null> {
    if (!id) return null;
    
    await this.init();

    try {
      // Try IndexedDB first
      if (this.db) {
        const image = await this.getFromIndexedDB(id);
        if (image) {
          await this.updateLastAccessed(id);
          return image.data;
        }
      }

      // Fallback to localStorage
      return this.getFromLocalStorage(id);
      
    } catch (error) {
      console.error('❌ Failed to retrieve image:', id, error);
      return null;
    }
  }

  /**
   * Remove image by ID
   */
  async removeImage(id: string): Promise<void> {
    if (!id) return;
    
    await this.init();

    try {
      if (this.db) {
        await this.removeFromIndexedDB(id);
      }
      this.removeFromLocalStorage(id);
    } catch (error) {
      console.error('❌ Failed to remove image:', id, error);
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalImages: number;
    totalSize: number;
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
      return { totalImages: 0, totalSize: 0, storageType: 'unavailable' };
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

  private async getIndexedDBStats(): Promise<{ totalImages: number; totalSize: number }> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result;
        const totalImages = results.length;
        const totalSize = results.reduce((sum, item) => sum + (item.size || 0), 0);
        resolve({ totalImages, totalSize });
      };
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

  private getLocalStorageStats(): { totalImages: number; totalSize: number } {
    let totalImages = 0;
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('img_')) {
        totalImages++;
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }
    }

    return { totalImages, totalSize };
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

  // Utility methods
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    };
  }

  private extractMimeType(dataUrl: string): string {
    const match = dataUrl.match(/^data:([^;]+)/);
    return match ? match[1] : 'image/jpeg';
  }
}

// Export singleton instance
export const imageStorage = new ModernImageStorage();

// Export convenience functions
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