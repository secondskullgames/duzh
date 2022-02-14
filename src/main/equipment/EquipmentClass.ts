import PaletteSwaps from '../types/PaletteSwaps';
import { EquipmentSlot, ItemCategory } from '../types/types';
import memoize from '../utils/memoize';

interface EquipmentClass {
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

const _load = async (id: string): Promise<EquipmentClass> => {
  const json = (await import(`../../../data/equipment/${id}.json`)).default;
  return {
    ...json,
    id,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: PaletteSwaps.create(json.paletteSwaps),
  };
};

namespace EquipmentClass {
  export const load = memoize(_load);
}

export default EquipmentClass;
