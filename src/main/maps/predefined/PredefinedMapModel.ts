import EquipmentModel from '../../equipment/EquipmentModel';
import { DoorDirection } from '../../objects/Door';
import ItemModel from '../../items/ItemModel';
import Music from '../../sounds/Music';
import { Figure } from '../../sounds/types';
import Color, { Colors } from '../../types/Color';
import { TileSetName } from '../../tiles/TileSet';
import TileType from '../../tiles/TileType';
import UnitClass from '../../units/UnitClass';
import { checkNotNull } from '../../utils/preconditions';

type PredefinedMapModel = {
  imageFilename: string,
  tileset: TileSetName,
  levelNumber: number,
  tileColors: Record<Color, TileType>,
  defaultTile?: TileType
  enemyColors: Record<Color, UnitClass>,
  itemColors: Record<Color, ItemModel>,
  equipmentColors: Record<Color, EquipmentModel>,
  doorColors: Record<Color, DoorDirection>,
  spawnerColors: Record<Color, string>;
  startingPointColor: Color,
  music: Figure[]
};

const _load = async (id: string): Promise<PredefinedMapModel> => {
  const json = (await import(
    /* webpackMode: "eager" */
    `../../../../data/maps/predefined/${id}.json`
  )).default;
  const tileColors = await _convertColorMap(json.tileColors, x => Promise.resolve(x));
  const enemyColors = await _convertColorMap(json.enemyColors, UnitClass.load);
  const itemColors = await _convertColorMap(json.itemColors, x => Promise.resolve(ItemModel.load(x)));
  const equipmentColors = await _convertColorMap(json.equipmentColors, EquipmentModel.load);
  const doorColors = await _convertColorMap(json.doorColors, x => Promise.resolve(x));
  const spawnerColors = await _convertColorMap(json.spawnerColors, x => Promise.resolve(x));
  const startingPointColor = checkNotNull(Colors[json.startingPointColor]);
  const levelNumber = parseInt(json.levelNumber);
  const music = json.music ? await Music.loadMusic(json.music as string) : null;

  return {
    ...json,
    tileColors,
    enemyColors,
    itemColors,
    equipmentColors,
    doorColors,
    spawnerColors,
    startingPointColor,
    levelNumber,
    music
  };
};

const _convertColorMap = async <T> (
  map: Record<string, string>,
  valueFunc: (value: string) => Promise<T>
): Promise<Record<Color, T>> => {
  const converted: Record<Color, T> = {};
  for (const [colorName, value] of Object.entries(map)) {
    const color = Colors[colorName];
    converted[color] = await valueFunc(value);
  }
  return converted;
};

namespace PredefinedMapModel {
  export const load = _load;
}

export default PredefinedMapModel;
