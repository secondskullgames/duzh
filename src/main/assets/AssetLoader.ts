import { injectable } from 'inversify';
import { AnySchema } from 'ajv';

export interface AssetLoader {
  /**
   * @param filename Relative to the schema directory, e.g. "EquipmentModel.schema.json"
   */
  loadSchemaAsset: (filename: string) => Promise<AnySchema>;
  /**
   * @param filename Relative to the data directory, e.g. "units/player.json"
   */
  loadDataAsset: <T>(filename: string) => Promise<T>;
  /**
   * @param filename Relative to the image directory, e.g. "units/player/player_standing_N_1.png"
   */
  loadImageAsset: (filename: string) => Promise<string | null>;
}

export const AssetLoader = Symbol('AssetLoader');

@injectable()
export class AssetLoaderImpl implements AssetLoader {
  loadSchemaAsset = async (filename: string): Promise<AnySchema> => {
    return (
      await import(
        /* webpackInclude: /\.schema\.json$/ */
        /* webpackMode: "lazy-once" */
        /* webpackChunkName: "schemas" */
        `/src/gen-schema/${filename}`
      )
    ).default;
  };

  loadDataAsset = async <T>(filename: string): Promise<T> => {
    return (
      await import(
        /* webpackInclude: /\.json$/ */
        /* webpackMode: "lazy-once" */
        /* webpackChunkName: "models" */
        `/data/${filename}`
      )
    ).default;
  };

  loadImageAsset = async (filename: string): Promise<string | null> => {
    try {
      return (
        await import(
          /* webpackInclude: /\.png$/ */
          /* webpackMode: "lazy-once" */
          /* webpackChunkName: "images" */
          `/png/${filename}`
        )
      ).default;
    } catch {
      // this is expected for _B filenames
      return null;
    }
  };
}
