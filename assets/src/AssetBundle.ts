import { z } from 'zod';
import {
  ConsumableItemModelSchema,
  DynamicSpriteModelSchema,
  EquipmentModelSchema,
  GeneratedMapModelSchema,
  MapSpecSchema,
  MusicModelSchema,
  PredefinedMapModelSchema,
  SoundEffectSchema,
  StaticSpriteModelSchema,
  TileSetModelSchema,
  UnitModelSchema
} from '@duzh/models';

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
