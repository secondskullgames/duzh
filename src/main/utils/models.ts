import Ajv from 'ajv';
import SpriteCategory from '../graphics/sprites/SpriteCategory';
import UnitModel from '../schemas/UnitModel';
import EquipmentModel from '../schemas/EquipmentModel';
import GeneratedMapModel from '../schemas/GeneratedMapModel';
import PredefinedMapModel from '../schemas/PredefinedMapModel';
import ConsumableItemModel from '../schemas/ConsumableItemModel';
import TileSetModel from '../schemas/TileSetModel';
import StaticSpriteModel from '../schemas/StaticSpriteModel';
import DynamicSpriteModel from '../schemas/DynamicSpriteModel';

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
  | 'ConsumableItemModel'

const ajv = new Ajv();
let loadedSchemas = false;

const _loadSchemas = async () => {
  for (const schemaName of schemaNames) {
    console.debug(`Loading schema ${schemaName}`);
    const schema = (await import(
      /* webpackMode: "lazy-once" */
      /* webpackChunkName: "schemas" */
      `../../gen-schema/${schemaName}.schema.json`
    )).default;
    ajv.addSchema(schema);
  }
};

const loadModel = async <T> (path: string, schema: SchemaType): Promise<T> => {
  if (!loadedSchemas) {
    await _loadSchemas();
    loadedSchemas = true;
  }
  const validate = ajv.getSchema(schema);
  if (!validate) {
    throw new Error(`Failed to load schema ${schema}`);
  }

  console.debug(`Validating ${path}`);
  const data = (await import(
    /* webpackMode: "lazy-once" */
    /* webpackChunkName: "models" */
    `../../../data/${path}.json`
  )).default;
  if (!validate(data)) {
    throw new Error(`Failed to validate ${path}:\n${JSON.stringify(validate.errors, null, 4)}`);
  }
  return data as T;
};

export const loadUnitModel = async (id: string): Promise<UnitModel> =>
  loadModel(`units/${id}`, 'UnitModel');

export const loadEquipmentModel = async (id: string): Promise<EquipmentModel> =>
  loadModel(`equipment/${id}`, 'EquipmentModel');

export const loadGeneratedMapModel = async (id: string): Promise<GeneratedMapModel> =>
  loadModel(`maps/generated/${id}`, 'GeneratedMapModel');

export const loadPredefinedMapModel = async (id: string): Promise<PredefinedMapModel> =>
  loadModel(`maps/predefined/${id}`, 'PredefinedMapModel');

export const loadDynamicSpriteModel = async (id: string, category: SpriteCategory): Promise<DynamicSpriteModel> =>
  loadModel(`sprites/${category}/${id}`, 'DynamicSpriteModel');

export const loadStaticSpriteModel = async (id: string): Promise<StaticSpriteModel> =>
  loadModel(`sprites/static/${id}`, 'StaticSpriteModel');

export const loadTileSetModel = async (id: string): Promise<TileSetModel> =>
  loadModel(`tilesets/${id}`, 'TileSetModel');

export const loadItemModel = async (id: string): Promise<ConsumableItemModel> =>
  loadModel(`items/${id}`, 'ConsumableItemModel');
