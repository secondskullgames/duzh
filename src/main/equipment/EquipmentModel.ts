import PaletteSwaps from '../graphics/PaletteSwaps';
import memoize from '../utils/memoize';

interface EquipmentModel {
  id: string,
  name: string,
  sprite: string,
  mapIcon: string,
  itemCategory: string, // ItemCategory,
  slot: string, // EquipmentSlot,
  paletteSwaps: Record<string, string>, // "friendly" color names
  damage?: number,
  blockAmount?: number, // typically only for shields
  script: string, // EquipmentScript
}

const _load = async (id: string): Promise<EquipmentModel> => {
  const json = (await import(
    /* webpackMode: "eager" */
    `../../../data/equipment/${id}.json`
  )).default;
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
