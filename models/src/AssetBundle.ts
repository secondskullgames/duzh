import { z } from 'zod';
import { EquipmentModelSchema } from './EquipmentModel.js';
import { ConsumableItemModelSchema } from './ConsumableItemModel.js';
import { PredefinedMapModelSchema } from './PredefinedMapModel.js';
import { GeneratedMapModelSchema } from './GeneratedMapModel.js';
import { StaticSpriteModelSchema } from './StaticSpriteModel.js';
import { DynamicSpriteModelSchema } from './DynamicSpriteModel.js';
import { TileSetModelSchema } from './TileSetModel.js';
import { UnitModelSchema } from './UnitModel.js';
import { MusicModelSchema, SoundEffectSchema } from './SoundModels.js';
import { MapSpecSchema } from './MapSpec.js';

const idMap = <S extends z.ZodSchema>(schema: S): z.ZodRecord<z.ZodString, S> => {
  return z.record(z.string(), schema);
};

export const AssetBundleSchema = z.object({
  equipment: idMap(EquipmentModelSchema),
  items: idMap(ConsumableItemModelSchema),
  predefinedMaps: idMap(PredefinedMapModelSchema),
  generatedMaps: idMap(GeneratedMapModelSchema),
  staticSprites: idMap(StaticSpriteModelSchema),
  dynamicSprites: idMap(DynamicSpriteModelSchema),
  tileSets: idMap(TileSetModelSchema),
  units: idMap(UnitModelSchema),
  sounds: idMap(SoundEffectSchema),
  music: idMap(MusicModelSchema),
  colors: idMap(z.string()),
  maps: z.array(MapSpecSchema)
});

export type AssetBundle = z.infer<typeof AssetBundleSchema>;
