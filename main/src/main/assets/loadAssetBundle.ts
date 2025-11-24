import { AssetBundle, AssetBundleImpl } from '@main/assets/AssetBundle';
import { ZodObject } from 'zod';
import { z } from 'zod';
import {
  ConsumableItemModelSchema,
  DynamicSpriteModelSchema,
  EquipmentModelSchema,
  GeneratedMapModelSchema,
  PredefinedMapModelSchema,
  StaticSpriteModelSchema,
  TileSetModelSchema,
  UnitModelSchema
} from '@duzh/models';
import { Image } from '@lib/graphics/images/Image';
import ImageLoader from '@lib/graphics/images/ImageLoader';

export const loadAssetBundle = async (imageLoader: ImageLoader): Promise<AssetBundle> => {
  const equipmentAssets = import.meta.glob(`/data/equipment/**/*.json`) as AssetGlob;
  const itemAssets = import.meta.glob(`/data/items/**/*.json`) as AssetGlob;
  const generatedMapAssets = import.meta.glob(
    `/data/maps/generated/**/*.json`
  ) as AssetGlob;
  const predefinedMapAssets = import.meta.glob(
    `/data/maps/predefined/**/*.json`
  ) as AssetGlob;
  const unitSpriteAssets = import.meta.glob(`/data/sprites/units/**/*.json`) as AssetGlob;
  const equipmentSpriteAssets = import.meta.glob(
    `/data/sprites/equipment/**/*.json`
  ) as AssetGlob;
  const staticSpriteAssets = import.meta.glob(
    `/data/sprites/static/**/*.json`
  ) as AssetGlob;
  const tileSetAssets = import.meta.glob(`/data/tilesets/**/*.json`) as AssetGlob;
  const unitAssets = import.meta.glob(`/data/units/**/*.json`) as AssetGlob;
  const imageAssets = import.meta.glob(`/png/**/*.png`) as AssetGlob;

  return new AssetBundleImpl({
    equipment: await loadAssets(equipmentAssets, EquipmentModelSchema),
    images: await loadImageAssets(imageAssets, imageLoader),
    items: await loadAssets(itemAssets, ConsumableItemModelSchema),
    maps: {
      predefined: await loadAssets(predefinedMapAssets, PredefinedMapModelSchema),
      generated: await loadAssets(generatedMapAssets, GeneratedMapModelSchema)
    },
    sprites: {
      static: await loadAssets(staticSpriteAssets, StaticSpriteModelSchema),
      dynamic: [
        ...(await loadAssets(unitSpriteAssets, DynamicSpriteModelSchema)),
        ...(await loadAssets(equipmentSpriteAssets, DynamicSpriteModelSchema))
      ]
    },
    tileSets: await loadAssets(tileSetAssets, TileSetModelSchema),
    units: await loadAssets(unitAssets, UnitModelSchema)
  });
};

type AssetGlob = Record<string, () => Promise<{ default: unknown }>>;

const loadAssets = <S extends ZodObject>(
  assetGlob: AssetGlob,
  schema: S
): Promise<z.infer<S>[]> => {
  return Promise.all(
    Object.values(assetGlob).map(async module => {
      const value = (await module()).default;
      return schema.parse(value);
    })
  );
};

const loadImageAssets = async (
  assetGlob: AssetGlob,
  imageLoader: ImageLoader
): Promise<Record<string, Image>> => {
  return Object.fromEntries(
    await Promise.all(
      Object.values(assetGlob).map(async module => {
        const filename = (await module()).default as string;
        return [filename, await imageLoader.loadImage(filename)];
      })
    )
  );
};
