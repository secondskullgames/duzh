import EquipmentClass from '../../items/equipment/EquipmentClass';
import ItemClass from '../../items/ItemClass';
import Color, { Colors } from '../../types/Color';
import { TileSetName } from '../../types/TileSet';
import TileType from '../../types/TileType';
import UnitClass from '../../units/UnitClass';

type PredefinedMapModel = {
  imageFilename: string,
  tileset: TileSetName,
  levelNumber: number,
  tileColors: Map<Color, TileType>,
  enemyColors: Map<Color, UnitClass>,
  // TODO: unify the below two fields into `objectColors`?
  itemColors: Map<Color, ItemClass>,
  equipmentColors: Map<Color, EquipmentClass>,
  startingPointColor: Color
};

const _load = async (id: string): Promise<PredefinedMapModel> => {
  const json = (await import(`../../../../data/maps/predefined/${id}.json`)).default;
  const tileColors = await _convertColorMap(json.tileColors, x => Promise.resolve(x));
  const enemyColors = await _convertColorMap(json.enemyColors, UnitClass.load);
  const itemColors = await _convertColorMap(json.itemColors, x => Promise.resolve(ItemClass.load(x)));
  const equipmentColors = await _convertColorMap(json.equipmentColors, EquipmentClass.load);
  const startingPointColor = Colors[json.startingPointColor];
  const levelNumber = parseInt(json.levelNumber);

  return {
    ...json,
    tileColors,
    enemyColors,
    itemColors,
    equipmentColors,
    startingPointColor,
    levelNumber
  };
};

const _convertColorMap = async <T> (
  map: Record<string, string>,
  valueFunc: (value: string) => Promise<T>
): Promise<Map<Color, T>> => {
  const converted: Map<Color, T> = new Map();
  for (const [colorName, value] of Object.entries(map)) {
    const color = Colors[colorName];
    converted.set(color, await valueFunc(value));
  }
  return converted;
};

namespace PredefinedMapModel {
  export const load = _load;
}

export default PredefinedMapModel;
