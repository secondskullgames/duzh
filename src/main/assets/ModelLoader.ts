import { SpriteCategory } from '@main/graphics/sprites/SpriteCategory';
import { AssetLoader, Module } from '@lib/assets/AssetLoader';
import { GeneratedMapModel, GeneratedMapModelSchema } from '@models/GeneratedMapModel';
import {
  ConsumableItemModel,
  ConsumableItemModelSchema
} from '@models/ConsumableItemModel';
import { DynamicSpriteModel, DynamicSpriteModelSchema } from '@models/DynamicSpriteModel';
import { UnitModel, UnitModelSchema } from '@models/UnitModel';
import { EquipmentModel, EquipmentModelSchema } from '@models/EquipmentModel';
import { PredefinedMapModel, PredefinedMapModelSchema } from '@models/PredefinedMapModel';
import { TileSetModel, TileSetModelSchema } from '@models/TileSetModel';
import { StaticSpriteModel, StaticSpriteModelSchema } from '@models/StaticSpriteModel';
import { z, ZodObject } from 'zod';

/**
 * Utility methods for working with models (in /data/) and schemas (in /src/models)
 *
 * TODO - this class is a mess, unify with AssetLoader
 */
export default class ModelLoader {
  constructor(private readonly assetLoader: AssetLoader) {}

  private _loadModel = async <S extends ZodObject>(
    path: string,
    schema: S
  ): Promise<z.infer<S>> => {
    const data = await this.assetLoader.loadDataAsset(`${path}.json`);
    return schema.parse(data);
  };

  loadUnitModel = async (id: string): Promise<UnitModel> =>
    this._loadModel(`units/${id}`, UnitModelSchema);

  loadEquipmentModel = async (id: string): Promise<EquipmentModel> =>
    this._loadModel(`equipment/${id}`, EquipmentModelSchema);

  loadGeneratedMapModel = async (id: string): Promise<GeneratedMapModel> =>
    this._loadModel(`maps/generated/${id}`, GeneratedMapModelSchema);

  loadPredefinedMapModel = async (id: string): Promise<PredefinedMapModel> =>
    this._loadModel(`maps/predefined/${id}`, PredefinedMapModelSchema);

  loadDynamicSpriteModel = async (
    id: string,
    category: SpriteCategory
  ): Promise<DynamicSpriteModel> =>
    this._loadModel(`sprites/${category}/${id}`, DynamicSpriteModelSchema);

  loadStaticSpriteModel = async (id: string): Promise<StaticSpriteModel> =>
    this._loadModel(`sprites/static/${id}`, StaticSpriteModelSchema);

  loadTileSetModel = async (id: string): Promise<TileSetModel> =>
    this._loadModel(`tilesets/${id}`, TileSetModelSchema);

  loadItemModel = async (id: string): Promise<ConsumableItemModel> =>
    this._loadModel(`items/${id}`, ConsumableItemModelSchema);

  loadAllUnitModels = async (): Promise<UnitModel[]> => {
    const globImport = import.meta.glob(`/data/units/**/*.json`, { eager: true });

    const models: UnitModel[] = [];
    for (const filename of Object.keys(globImport)) {
      const model = (globImport[filename] as Module).default as UnitModel;
      models.push(model);
    }
    return models;
  };

  loadAllConsumableModels = async (): Promise<ConsumableItemModel[]> => {
    const globImport = import.meta.glob(`/data/items/**/*.json`, { eager: true });

    const models: ConsumableItemModel[] = [];
    for (const filename of Object.keys(globImport)) {
      const model = (globImport[filename] as Module).default as ConsumableItemModel;
      models.push(model);
    }
    return models;
  };

  loadAllEquipmentModels = async (): Promise<EquipmentModel[]> => {
    const globImport = import.meta.glob(`/data/equipment/**/*.json`, { eager: true });

    const models: EquipmentModel[] = [];
    for (const filename of Object.keys(globImport)) {
      const model = (globImport[filename] as Module).default as EquipmentModel;
      models.push(model);
    }
    return models;
  };
}
