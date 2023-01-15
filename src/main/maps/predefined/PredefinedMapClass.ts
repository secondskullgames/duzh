import { PredefinedMapModel } from '../../../gen-schema/predefined-map.schema';
import Color from '../../graphics/Color';
import Colors from '../../graphics/Colors';
import { DoorDirection } from '../../objects/Door';
import Music from '../../sounds/Music';
import { Figure } from '../../sounds/types';
import TileType from '../../tiles/TileType';
import { loadModel } from '../../utils/models';
import { checkNotNull } from '../../utils/preconditions';

type PredefinedMapClass = {
  imageFilename: string,
  tileset: string,
  levelNumber: number,
  defaultTile?: TileType,
  /**
   * hex color -> tile type
   */
  tileColors: Record<string, string>,
  /**
   * hex color -> unit class name
   */
  enemyColors: Record<string, string>,
  /**
   * hex color -> item class name
   */
  itemColors: Record<string, string>,
  /**
   * hex color -> equipment class name
   */
  equipmentColors: Record<string, string>,
  doorColors: Record<string, DoorDirection>,
  spawnerColors: Record<string, string>;
  startingPointColor: Color,
  music: Figure[] | null
};

const _fromModel = async (model: PredefinedMapModel): Promise<PredefinedMapClass> => {
  const tileColors = model.tileColors;
  const enemyColors = model.enemyColors;
  const itemColors = model.itemColors;
  const equipmentColors = model.equipmentColors;
  const doorColors = await _convertColorMap(model.doorColors ?? {}, x => Promise.resolve(x as DoorDirection));
  const spawnerColors = await _convertColorMap(model.spawnerColors ?? {}, x => Promise.resolve(x));
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
  map: Record<string, string> | undefined,
  valueFunc: (value: string) => Promise<T>
): Promise<Record<string, T>> => {
  const converted: Record<string, T> = {};
  if (map) {
    for (const [colorName, value] of Object.entries(map)) {
      const color = Colors[colorName];
      converted[color.hex] = await valueFunc(value);
    }
  }
  return converted;
};

namespace PredefinedMapClass {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`maps/predefined/${id}`, 'predefined-map'));
}

export default PredefinedMapClass;
