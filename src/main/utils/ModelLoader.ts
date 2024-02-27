import { SpriteCategory } from '@main/graphics/sprites/SpriteCategory';
import { AssetLoader } from '@main/assets/AssetLoader';
import Ajv from 'ajv';
import { inject, injectable } from 'inversify';
import type UnitModel from '../schemas/UnitModel';
import type EquipmentModel from '../schemas/EquipmentModel';
import type GeneratedMapModel from '../schemas/GeneratedMapModel';
import type PredefinedMapModel from '../schemas/PredefinedMapModel';
import type ConsumableItemModel from '../schemas/ConsumableItemModel';
import type TileSetModel from '../schemas/TileSetModel';
import type StaticSpriteModel from '../schemas/StaticSpriteModel';
import type DynamicSpriteModel from '../schemas/DynamicSpriteModel';

/**
 * Utility methods for working with models (in /data/) and schemas (in /src/main/schemas)
 */

export const schemaNames = [
  'DoorDirection',
  'UnitType',
  'TileType',
  'MapType',
  'MapSpec',
  'UnitModel',
  'EquipmentStats',
  'EquipmentSlot',
  'ItemCategory',
  'EquipmentModel',
  'PredefinedMapModel',
  'GeneratedMapModel',
  'StaticSpriteModel',
  'DynamicSpriteModel',
  'TileSetModel',
  'ConsumableType',
  'ConsumableItemModel'
];

type SchemaType =
  | 'DoorDirection'
  | 'UnitType'
  | 'TileType'
  | 'MapType'
  | 'MapSpec'
  | 'UnitModel'
  | 'EquipmentStats'
  | 'EquipmentSlot'
  | 'ItemCategory'
  | 'EquipmentModel'
  | 'PredefinedMapModel'
  | 'GeneratedMapModel'
  | 'StaticSpriteModel'
  | 'DynamicSpriteModel'
  | 'TileSetModel'
  | 'ConsumableType'
  | 'ConsumableItemModel';

@injectable()
export default class ModelLoader {
  private readonly ajv = new Ajv();
  private loadedSchemas = false;

  constructor(
    @inject(AssetLoader)
    private readonly assetLoader: AssetLoader
  ) {}

  private _loadSchemas = async () => {
    for (const schemaName of schemaNames) {
      const schema = await this.assetLoader.loadSchemaAsset(`${schemaName}.schema.json`);
      this.ajv.addSchema(schema);
    }
  };

  private _loadModel = async <T>(path: string, schema: SchemaType): Promise<T> => {
    if (!this.loadedSchemas) {
      await this._loadSchemas();
      this.loadedSchemas = true;
    }

    const validate = this.ajv.getSchema(schema);
    if (!validate) {
      throw new Error(`Failed to load schema ${schema}`);
    }

    const data = await this.assetLoader.loadDataAsset(`${path}.json`);
    if (!validate(data)) {
      throw new Error(
        `Failed to validate ${path}:\n${JSON.stringify(validate.errors, null, 4)}`
      );
    }
    return data as T;
  };

  loadUnitModel = async (id: string): Promise<UnitModel> =>
    this._loadModel(`units/${id}`, 'UnitModel');

  loadEquipmentModel = async (id: string): Promise<EquipmentModel> =>
    this._loadModel(`equipment/${id}`, 'EquipmentModel');

  loadGeneratedMapModel = async (id: string): Promise<GeneratedMapModel> =>
    this._loadModel(`maps/generated/${id}`, 'GeneratedMapModel');

  loadPredefinedMapModel = async (id: string): Promise<PredefinedMapModel> =>
    this._loadModel(`maps/predefined/${id}`, 'PredefinedMapModel');

  loadDynamicSpriteModel = async (
    id: string,
    category: SpriteCategory
  ): Promise<DynamicSpriteModel> =>
    this._loadModel(`sprites/${category}/${id}`, 'DynamicSpriteModel');

  loadStaticSpriteModel = async (id: string): Promise<StaticSpriteModel> =>
    this._loadModel(`sprites/static/${id}`, 'StaticSpriteModel');

  loadTileSetModel = async (id: string): Promise<TileSetModel> =>
    this._loadModel(`tilesets/${id}`, 'TileSetModel');

  loadItemModel = async (id: string): Promise<ConsumableItemModel> =>
    this._loadModel(`items/${id}`, 'ConsumableItemModel');

  loadAllUnitModels = async (): Promise<UnitModel[]> => {
    const requireContext = require.context('../../../data/units', false, /\.json$/i);

    const models: UnitModel[] = [];
    for (const filename of requireContext.keys()) {
      const model = (await requireContext(filename)) as UnitModel;
      models.push(model);
    }
    return models;
  };

  loadAllConsumableModels = async (): Promise<ConsumableItemModel[]> => {
    const requireContext = require.context('../../../data/items', false, /\.json$/i);

    const models: ConsumableItemModel[] = [];
    for (const filename of requireContext.keys()) {
      const model = (await requireContext(filename)) as ConsumableItemModel;
      models.push(model);
    }
    return models;
  };

  loadAllEquipmentModels = async (): Promise<EquipmentModel[]> => {
    const requireContext = require.context('../../../data/equipment', false, /\.json$/i);

    const models: EquipmentModel[] = [];
    for (const filename of requireContext.keys()) {
      const model = (await requireContext(filename)) as EquipmentModel;
      models.push(model);
    }
    return models;
  };
}
