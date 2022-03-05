import ItemCategory from '../items/ItemCategory';
import PaletteSwaps from '../types/PaletteSwaps';
import memoize from '../utils/memoize';
import EquipmentSlot from './EquipmentSlot';

interface EquipmentModel {
  id: string,
  name: string,
  sprite: string,
  mapIcon: string,
  itemCategory: ItemCategory,
  slot: EquipmentSlot,
  paletteSwaps: PaletteSwaps,
  damage?: number,
  // TODO move these somewhere else - just used to control item spawns
  minLevel: number,
  maxLevel: number,
}

const _load = async (id: string): Promise<EquipmentModel> => {
  const json = (await import(`../../../data/equipment/${id}.json`)).default;
  return {
    ...json,
    id,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: PaletteSwaps.create(json.paletteSwaps),
  };
};

namespace EquipmentModel {
  export const load = memoize(_load);
}

export default EquipmentModel;
