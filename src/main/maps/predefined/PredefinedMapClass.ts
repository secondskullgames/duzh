import { PredefinedMapModel } from '../../../gen-schema/predefined-map.schema';
import EquipmentClass from '../../equipment/EquipmentClass';
import Color from '../../graphics/Color';
import Colors from '../../graphics/Colors';
import { DoorDirection } from '../../objects/Door';
import ItemClass from '../../items/ItemClass';
import Music from '../../sounds/Music';
import { Figure } from '../../sounds/types';
import TileType from '../../tiles/TileType';
import UnitClass from '../../units/UnitClass';
import { loadModel } from '../../utils/models';
import { checkNotNull } from '../../utils/preconditions';

type PredefinedMapClass = {
  imageFilename: string,
  tileset: string,
  levelNumber: number,
  tileColors: Record<string, TileType>,
  defaultTile?: TileType
  enemyColors: Record<string, UnitClass>,
  itemColors: Record<string, ItemClass>,
  equipmentColors: Record<string, EquipmentClass>,
  doorColors: Record<string, DoorDirection>,
  spawnerColors: Record<string, string>;
  startingPointColor: Color,
  music: Figure[] | null
};

const _fromModel = async (model: PredefinedMapModel): Promise<PredefinedMapClass> => {
  const tileColors = await _convertColorMap(model.tileColors, x => Promise.resolve(x as TileType));
  const enemyColors = await _convertColorMap(model.enemyColors, UnitClass.load);
  const itemColors = await _convertColorMap(model.itemColors, x => Promise.resolve(ItemClass.load(x)));
  const equipmentColors = await _convertColorMap(model.equipmentColors, EquipmentClass.load);
  const doorColors = await _convertColorMap(model.doorColors || {}, x => Promise.resolve(x as DoorDirection));
  const spawnerColors = await _convertColorMap(model.spawnerColors || {}, x => Promise.resolve(x));
  const startingPointColor = checkNotNull(Colors[model.startingPointColor]);
  const music = model.music ? await Music.loadMusic(model.music as string) : null;

  return {
    ...model,
    tileColors,
    enemyColors,
    itemColors,
    equipmentColors,
    doorColors,
    spawnerColors,
    startingPointColor,
    music
  };
};

const _convertColorMap = async <T> (
  map: Record<string, string>,
  valueFunc: (value: string) => Promise<T>
): Promise<Record<string, T>> => {
  const converted: Record<string, T> = {};
  for (const [colorName, value] of Object.entries(map)) {
    const color = Colors[colorName];
    converted[color.hex] = await valueFunc(value);
  }
  return converted;
};

namespace PredefinedMapClass {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`maps/predefined/${id}`, 'predefined-map'));
}

export default PredefinedMapClass;
