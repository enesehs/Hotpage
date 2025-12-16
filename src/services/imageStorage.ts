import { logger } from '../utils/logger';

const DB_NAME = 'hotpage-images';
const DB_VERSION = 1;
const STORE_NAME = 'backgrounds';

interface StoredImage {
  id: string;
  blob: Blob;
  thumbnail?: Blob;
  filename: string;
  uploadedAt: number;
  originalSize: number;
  compressedSize: number;
}

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const THUMBNAIL_SIZE = 100;
const COMPRESSION_QUALITY = 0.85;

async function compressImage(file: File): Promise<{ compressed: Blob; thumbnail: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const aspectRatio = width / height;
        if (width > height) {
          width = MAX_WIDTH;
          height = width / aspectRatio;
        } else {
          height = MAX_HEIGHT;
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (compressedBlob) => {
          if (!compressedBlob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const thumbCanvas = document.createElement('canvas');
          const thumbSize = Math.min(THUMBNAIL_SIZE, Math.min(width, height));
          thumbCanvas.width = thumbSize;
          thumbCanvas.height = thumbSize;
          const thumbCtx = thumbCanvas.getContext('2d')!;

          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          thumbCtx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, thumbSize, thumbSize);

          thumbCanvas.toBlob(
            (thumbnailBlob) => {
              if (!thumbnailBlob) {
                reject(new Error('Failed to create thumbnail'));
                return;
              }
              resolve({ compressed: compressedBlob, thumbnail: thumbnailBlob });
            },
            'image/jpeg',
            0.7
          );
        },
        'image/jpeg',
        COMPRESSION_QUALITY
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
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
    const originalSize = file.size;
    logger.debug('ImageStorage', `Compressing image: ${file.name} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);

    try {
      const { compressed, thumbnail } = await compressImage(file);
      const compressedSize = compressed.size;
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      logger.info('ImageStorage', `Compressed ${file.name}: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressionRatio}% reduction)`);

      const imageData: StoredImage = {
        id,
        blob: compressed,
        thumbnail,
        filename: file.name,
        uploadedAt: Date.now(),
        originalSize,
        compressedSize,
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
    } catch (error) {
      logger.error('ImageStorage', 'Failed to compress image', error);
      throw error;
    }
  }

  async getThumbnail(id: string): Promise<string | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          const imageData = request.result as StoredImage;
          if (imageData.thumbnail) {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(imageData.thumbnail);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
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
