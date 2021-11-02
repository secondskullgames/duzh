import PaletteSwaps from '../../types/PaletteSwaps';
import { EquipmentSlot, ItemCategory } from '../../types/types';

interface EquipmentModel {
  id: string,
  name: string,
  sprite: string,
  mapIcon: string,
  itemCategory: ItemCategory,
  slot: EquipmentSlot,
  char: string,
  paletteSwaps: PaletteSwaps,
  damage?: number,
  // TODO move these somewhere else - just used to control item spawns
  minLevel: number,
  maxLevel: number,
}

const _map: Record<string, EquipmentModel> = {};

namespace EquipmentModel {
  export const forId = async (id: string): Promise<EquipmentModel> => {
    if (_map.hasOwnProperty(id)) {
      return _map[id];
    }
    return _load(id);
  };
}

const _load = async (id: string): Promise<EquipmentModel> => {
  const json = (await import(`../../../../data/equipment/${id}.json`)).default;
  return {
    ...json,
    id,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: PaletteSwaps.create(json.paletteSwaps),
  };
};

export default EquipmentModel;
