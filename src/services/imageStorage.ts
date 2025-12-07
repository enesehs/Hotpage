import { logger } from '../utils/logger';

// IndexedDB for storing background images as blobs
const DB_NAME = 'hotpage-images';
const DB_VERSION = 1;
const STORE_NAME = 'backgrounds';

interface StoredImage {
  id: string;
  blob: Blob;
  filename: string;
  uploadedAt: number;
}

class ImageStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.debug('ImageStorage', 'Initializing IndexedDB...');
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        logger.error('ImageStorage', 'Failed to open IndexedDB', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        logger.success('ImageStorage', 'IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        logger.info('ImageStorage', 'Upgrading database schema...');
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          logger.success('ImageStorage', 'Object store created');
        }
      };
    });
  }

  async saveImage(file: File): Promise<string> {
    if (!this.db) await this.init();

    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.debug('ImageStorage', `Saving image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    const imageData: StoredImage = {
      id,
      blob: file,
      filename: file.name,
      uploadedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(imageData);

      request.onsuccess = () => {
        logger.success('ImageStorage', `Image saved: ${id}`);
        resolve(id);
      };
      request.onerror = () => {
        logger.error('ImageStorage', 'Failed to save image', request.error);
        reject(request.error);
      };
    });
  }

  async getImage(id: string): Promise<string | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          const imageData = request.result as StoredImage;
          logger.debug('ImageStorage', `Loading image: ${id} (${imageData.filename})`);
          // Convert blob to data URL instead of object URL to avoid CORS issues
          const reader = new FileReader();
          reader.onloadend = () => {
            logger.success('ImageStorage', `Image loaded: ${id}`);
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            logger.error('ImageStorage', 'Failed to read image blob', reader.error);
            reject(reader.error);
          };
          reader.readAsDataURL(imageData.blob);
        } else {
          logger.warning('ImageStorage', `Image not found: ${id}`);
          resolve(null);
        }
      };
      request.onerror = () => {
        logger.error('ImageStorage', `Failed to get image: ${id}`, request.error);
        reject(request.error);
      };
    });
  }

  async getAllImages(): Promise<Array<{ id: string; url: string; filename: string }>> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = async () => {
        const storedImages = request.result as StoredImage[];
        logger.debug('ImageStorage', `Loading ${storedImages.length} stored images...`);
        const images = await Promise.all(
          storedImages.map(async (img) => {
            // Convert blob to data URL
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(img.blob);
            });
            return {
              id: img.id,
              url: dataUrl,
              filename: img.filename,
            };
          })
        );
        logger.success('ImageStorage', `Loaded ${images.length} images`);
        resolve(images);
      };
      request.onerror = () => {
        logger.error('ImageStorage', 'Failed to get all images', request.error);
        reject(request.error);
      };
    });
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      logger.debug('ImageStorage', `Deleting image: ${id}`);
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        logger.success('ImageStorage', `Image deleted: ${id}`);
        resolve();
      };
      request.onerror = () => {
        logger.error('ImageStorage', `Failed to delete image: ${id}`, request.error);
        reject(request.error);
      };
    });
  }

  async deleteAllImages(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      logger.warning('ImageStorage', 'Deleting all images...');
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        logger.success('ImageStorage', 'All images deleted');
        resolve();
      };
      request.onerror = () => {
        logger.error('ImageStorage', 'Failed to delete all images', request.error);
        reject(request.error);
      };
    });
  }

  async getStorageSize(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const totalSize = (request.result as StoredImage[]).reduce(
          (acc, img) => acc + img.blob.size,
          0
        );
        resolve(totalSize);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const imageStorage = new ImageStorage();
