import { readFile } from 'fs/promises';
import { glob } from 'glob';
import {
  AssetBundle,
  ConsumableItemModel,
  DynamicSpriteModel,
  EquipmentModel,
  GeneratedMapModel,
  MapSpec,
  MusicModel,
  PredefinedMapModel,
  SoundEffect,
  StaticSpriteModel,
  TileSetModel,
  UnitModel
} from '@duzh/models';
import { z } from 'zod';
import { mkdirSync } from 'fs';
import { writeFileSync } from 'node:fs';

export const buildAssetBundle = async (): Promise<AssetBundle> => {
  const equipment = await loadAssets('./data/equipment/**/*.json', EquipmentModel);
  const items = await loadAssets('./data/items/**/*.json', ConsumableItemModel);
  const predefinedMaps = await loadAssets(
    './data/maps/predefined/**/*.json',
    PredefinedMapModel
  );
  const generatedMaps = await loadAssets(
    './data/maps/generated/**/*.json',
    GeneratedMapModel
  );
  const dynamicSprites = [
    ...(await loadAssets('./data/sprites/units/**/*.json', DynamicSpriteModel)),
    ...(await loadAssets('./data/sprites/equipment/**/*.json', DynamicSpriteModel))
  ];
  const staticSprites = await loadAssets(
    './data/sprites/static/**/*.json',
    StaticSpriteModel
  );
  const tileSets = await loadAssets('./data/tilesets/**/*.json', TileSetModel);
  const units = await loadAssets('./data/units/**/*.json', UnitModel);
  const music = await loadAssets('./data/music/**/*.json', MusicModel);
  const sounds = await loadAssets('./data/sounds/**/*.json', SoundEffect);
  const colors = await loadAsset('./data/colors.json', z.record(z.string(), z.string()));
  const maps = await loadAsset('./data/maps.json', z.array(MapSpec));

  return {
    equipment: mapById(equipment),
    items: mapById(items),
    predefinedMaps: mapById(predefinedMaps),
    generatedMaps: mapById(generatedMaps),
    dynamicSprites: mapById(dynamicSprites),
    staticSprites: mapById(staticSprites),
    tileSets: mapById(tileSets),
    units: mapById(units),
    music: mapById(music),
    sounds: mapById(sounds),
    colors,
    maps
  };
};

const loadAsset = async <S extends z.Schema>(
  filename: string,
  schema: S
): Promise<z.infer<S>> => {
  const contents = await readFile(filename, 'utf-8');
  return schema.parse(JSON.parse(contents));
};

const loadAssets = async <S extends z.Schema>(
  globPattern: string,
  schema: S
): Promise<z.infer<S>[]> => {
  const filenames = await glob(globPattern);
  return Promise.all(filenames.map(filename => loadAsset(filename, schema)));
};

const mapById = <T extends { id: string }>(items: T[]): Record<string, T> => {
  return Object.fromEntries(items.map(item => [item.id, item]));
};

const assetBundleSize = (assetBundle: AssetBundle) => {
  const mapLength = (map: Record<any, unknown>): number => Object.keys(map).length;

  return (
    mapLength(assetBundle.items) +
    mapLength(assetBundle.equipment) +
    mapLength(assetBundle.predefinedMaps) +
    mapLength(assetBundle.generatedMaps) +
    mapLength(assetBundle.units) +
    mapLength(assetBundle.sounds) +
    mapLength(assetBundle.music) +
    mapLength(assetBundle.staticSprites) +
    mapLength(assetBundle.dynamicSprites) +
    mapLength(assetBundle.tileSets)
  );
};

const assetBundle = await buildAssetBundle();
const outFile = 'build/assets.json';
mkdirSync('build', { recursive: true });
writeFileSync(outFile, JSON.stringify(assetBundle));

console.log(`Wrote ${assetBundleSize(assetBundle)} assets to ${outFile}`);
