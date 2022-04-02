import ItemCategory from '../items/ItemCategory';
import PaletteSwaps from '../graphics/PaletteSwaps';
import EquipmentModel from './EquipmentModel';
import EquipmentSlot from './EquipmentSlot';
import EquipmentScript from './EquipmentScript';

interface EquipmentClass {
  name: string,
  sprite: string,
  mapIcon: string,
  itemCategory: ItemCategory,
  slot: EquipmentSlot,
  paletteSwaps: PaletteSwaps,
  damage?: number,
  blockAmount?: number, // typically only for shields
  script: EquipmentScript
}

const _fromModel = async (model: EquipmentModel): Promise<EquipmentClass> => {
  return {
    ...model,
    itemCategory: model.itemCategory as ItemCategory,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: PaletteSwaps.create(model.paletteSwaps),
    script: model.script as EquipmentScript,
    slot: model.slot as EquipmentSlot,
  };
};

namespace EquipmentClass {
  export const fromModel = _fromModel;
  export const load = async (equipmentModelId: string) => _fromModel(await EquipmentModel.load(equipmentModelId));
}

export default EquipmentClass;
