import { z } from 'zod';
import { EquipmentModel } from './EquipmentModel.js';
import { ConsumableItemModel } from './ConsumableItemModel.js';
import { PredefinedMapModel } from './PredefinedMapModel.js';
import { GeneratedMapModel } from './GeneratedMapModel.js';
import { StaticSpriteModel } from './StaticSpriteModel.js';
import { DynamicSpriteModel } from './DynamicSpriteModel.js';
import { TileSetModel } from './TileSetModel.js';
import { UnitModel } from './UnitModel.js';
import { MusicModel, SoundEffect } from './SoundModels.js';
import { MapSpec } from './MapSpec.js';

const idMap = <S extends z.ZodSchema>(schema: S): z.ZodRecord<z.ZodString, S> => {
  return z.record(z.string(), schema);
};

export const AssetBundle = z.object({
  equipment: idMap(EquipmentModel),
  items: idMap(ConsumableItemModel),
  predefinedMaps: idMap(PredefinedMapModel),
  generatedMaps: idMap(GeneratedMapModel),
  staticSprites: idMap(StaticSpriteModel),
  dynamicSprites: idMap(DynamicSpriteModel),
  tileSets: idMap(TileSetModel),
  units: idMap(UnitModel),
  sounds: idMap(SoundEffect),
  music: idMap(MusicModel),
  colors: idMap(z.string()),
  maps: z.array(MapSpec)
});

export type AssetBundle = z.infer<typeof AssetBundle>;
