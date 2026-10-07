/**
 * Client-side WebP image conversion and optimization utilities.
 * Converts uploaded images and clipboard screenshots to ultra-compact WebP format
 * in the browser prior to network upload, minimizing bandwidth and storage on Vercel Blob.
 */

export interface WebPConversionResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface ConvertOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (defaults: 0.85 for screenshots, 0.92 for micro-icons)
}

/**
 * Loads an Image from a Blob, File, or Object URL
 */
export function loadImage(source: string | Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const isUrl = typeof source === 'string';
    const objectUrl = isUrl ? source : URL.createObjectURL(source);

    img.onload = () => {
      if (!isUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      if (!isUrl) URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

/**
 * Converts any image file or blob to WebP format with optional downscaling.
 */
export async function convertImageToWebP(
  fileOrBlob: File | Blob,
  options: ConvertOptions = {}
): Promise<WebPConversionResult> {
  const originalSize = fileOrBlob.size;
  const img = await loadImage(fileOrBlob);

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  let targetWidth = naturalWidth;
  let targetHeight = naturalHeight;

  const maxWidth = options.maxWidth || 1920;
  const maxHeight = options.maxHeight || 1920;
  const quality = options.quality ?? 0.85;

  // Scale down maintaining aspect ratio if larger than bounds
  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const widthRatio = maxWidth / targetWidth;
    const heightRatio = maxHeight / targetHeight;
    const scale = Math.min(widthRatio, heightRatio);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to obtain 2D canvas context for WebP conversion');
  }

  // Draw image with smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const webpBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to WebP blob conversion failed'));
        }
      },
      'image/webp',
      quality
    );
  });

  const compressedSize = webpBlob.size;
  const compressionRatio = originalSize > 0 
    ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100)) 
    : 0;

  return {
    blob: webpBlob,
    width: targetWidth,
    height: targetHeight,
    originalSize,
    compressedSize,
    compressionRatio,
  };
}

/**
 * Crops a rectangular portion of an image and converts it directly to a crisp WebP snippet.
 * Ideal for extracting micro-icons and UI click buttons from full screenshots.
 */
export async function cropImageToWebP(
  source: string | Blob | File | HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  options: { quality?: number; maxDimension?: number } = {}
): Promise<WebPConversionResult> {
  const img = source instanceof HTMLImageElement ? source : await loadImage(source);
  const quality = options.quality ?? 0.92; // Higher quality for micro-icons to preserve crisp UI text

  let { width, height } = crop;
  if (width <= 0 || height <= 0) {
    throw new Error('Invalid crop dimensions');
  }

  const maxDim = options.maxDimension || 512;
  let targetWidth = width;
  let targetHeight = height;

  if (targetWidth > maxDim || targetHeight > maxDim) {
    const scale = Math.min(maxDim / targetWidth, maxDim / targetHeight);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to obtain 2D canvas context for crop');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  const webpBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas crop to WebP blob conversion failed'));
        }
      },
      'image/webp',
      quality
    );
  });

  return {
    blob: webpBlob,
    width: targetWidth,
    height: targetHeight,
    originalSize: 0,
    compressedSize: webpBlob.size,
    compressionRatio: 0,
  };
}

/**
 * Formats byte size into human readable string (e.g. 14.5 KB)
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
