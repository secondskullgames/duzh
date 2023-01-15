import { EquipmentStatsModel } from '../../gen-schema/equipment-stats.schema';
import { EquipmentModel } from '../../gen-schema/equipment.schema';
import ItemCategory from '../items/ItemCategory';
import PaletteSwaps from '../graphics/PaletteSwaps';
import { loadModel } from '../utils/models';
import EquipmentSlot from './EquipmentSlot';
import EquipmentScript from './EquipmentScript';

interface EquipmentClass {
  name: string,
  sprite: string,
  mapIcon: string,
  itemCategory: ItemCategory,
  slot: EquipmentSlot,
  paletteSwaps: PaletteSwaps,
  script: EquipmentScript,
  level: number | null,
  points: number | null,
  stats: EquipmentStatsModel
}

const _fromModel = async (model: EquipmentModel): Promise<EquipmentClass> => {
  return {
    name: model.name,
    sprite: model.sprite,
    mapIcon: model.mapIcon,
    level: model.level,
    points: model.points,
    itemCategory: model.itemCategory as ItemCategory,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: PaletteSwaps.create(model.paletteSwaps),
    script: model.script as EquipmentScript,
    slot: model.slot as EquipmentSlot,
    stats: model.stats
  };
};

const _loadAll = async (): Promise<EquipmentClass[]> => {
  const requireContext = require.context(
    '../../../data/equipment',
    false,
    /\.json$/i
  );

  return Promise.all(
    requireContext.keys()
      .map(filename => requireContext(filename) as EquipmentModel)
      .map(_fromModel)
  );
};

namespace EquipmentClass {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`equipment/${id}`, 'equipment'));
  export const loadAll = _loadAll;
}

export default EquipmentClass;
