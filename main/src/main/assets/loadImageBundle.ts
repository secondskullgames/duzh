import { ImageBundle, ImageBundleImpl } from '@main/assets/ImageBundle';

export const loadImageBundle = async (): Promise<ImageBundle> => {
  const imageAssets = import.meta.glob(`/png/**/*.png`) as AssetGlob;

  return new ImageBundleImpl(await loadImageAssets(imageAssets));
};

type AssetGlob = Record<string, () => Promise<{ default: unknown }>>;

const loadImageAssets = async (assetGlob: AssetGlob): Promise<Record<string, string>> => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(assetGlob).map(async ([filename, module]) => {
        const dataUrl = (await module()).default as string;
        const relativeFilename = filename.replaceAll(/^\/png\//g, '');
        return [relativeFilename, dataUrl];
      })
    )
  );
};
