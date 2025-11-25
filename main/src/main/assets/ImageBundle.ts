import { checkNotNull } from '@duzh/utils/preconditions';

/**
 * This might eventually get merged back into {@link AssetBundle}
 * but for now it's cleaner to keep them separate
 */
export interface ImageBundle {
  /**
   * TODO: for now, just mapping from filename => image data URL
   * In the future, we might preload all the Images/ImageData/ImageBitmap
   */
  getImageUrl: (path: string) => string;
  /**
   * TODO: for now, just mapping from filename => image data URL
   * In the future, we might preload all the Images/ImageData/ImageBitmap
   */
  getImageUrlOptional: (path: string) => string | null;
}

export class ImageBundleImpl implements ImageBundle {
  constructor(private readonly images: Record<string, string>) {}

  getImageUrl = (path: string): string => {
    return checkNotNull(this.images[path]);
  };

  getImageUrlOptional = (path: string): string | null => {
    return this.images[path] || null;
  };
}
