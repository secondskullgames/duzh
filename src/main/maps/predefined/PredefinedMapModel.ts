import EquipmentClass from '../../equipment/EquipmentClass';
import { DoorDirection } from '../../objects/Door';
import ItemClass from '../../objects/items/ItemClass';
import Color, { Colors } from '../../types/Color';
import { TileSetName } from '../../tiles/TileSet';
import TileType from '../../tiles/TileType';
import UnitClass from '../../units/UnitClass';

type PredefinedMapModel = {
  imageFilename: string,
  tileset: TileSetName,
  levelNumber: number,
  tileColors: Record<Color, TileType>,
  defaultTile?: TileType
  enemyColors: Record<Color, UnitClass>,
  // TODO: unify the below two fields into `objectColors`?
  itemColors: Record<Color, ItemClass>,
  equipmentColors: Record<Color, EquipmentClass>,
  doorColors: Record<Color, DoorDirection>,
  startingPointColor: Color
};

const _load = async (id: string): Promise<PredefinedMapModel> => {
  const json = (await import(`../../../../data/maps/predefined/${id}.json`)).default;
  const tileColors = await _convertColorMap(json.tileColors, x => Promise.resolve(x));
  const enemyColors = await _convertColorMap(json.enemyColors, UnitClass.load);
  const itemColors = await _convertColorMap(json.itemColors, x => Promise.resolve(ItemClass.load(x)));
  const equipmentColors = await _convertColorMap(json.equipmentColors, EquipmentClass.load);
  const doorColors = await _convertColorMap(json.doorColors, x => Promise.resolve(x));
  const startingPointColor = Colors[json.startingPointColor];
  const levelNumber = parseInt(json.levelNumber);

  return {
    ...json,
    tileColors,
    enemyColors,
    itemColors,
    equipmentColors,
    doorColors,
    startingPointColor,
    levelNumber
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
