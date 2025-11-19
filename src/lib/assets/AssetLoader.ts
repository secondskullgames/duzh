export interface AssetLoader {
  /**
   * @param filename Relative to the data directory, e.g. "units/player.json"
   */
  loadDataAsset: <T>(filename: string) => Promise<T>;
  /**
   * @param filename Relative to the image directory, e.g. "units/player/player_standing_N_1.png"
   */
  loadImageAsset: (filename: string) => Promise<string | null>;
}

export type Module = Readonly<{
  default: unknown;
}>;

export class AssetLoaderImpl implements AssetLoader {
  private readonly dataAssets = import.meta.glob(`/data/**/*.json`, { eager: true });
  private readonly imageAssets = import.meta.glob(`/png/**/*.png`, { eager: true });

  loadDataAsset = async <T>(filename: string): Promise<T> => {
    const module = this.dataAssets[`/data/${filename}`] as Module;
    return module.default as T;
  };

  loadImageAsset = async (filename: string): Promise<string | null> => {
    try {
      const module = this.imageAssets[`/png/${filename}`] as Module;
      return module.default as string;
    } catch {
      // this is expected for _B filenames
      return null;
    }
  };
}
