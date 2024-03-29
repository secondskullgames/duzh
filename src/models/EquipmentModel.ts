import { ItemCategory } from './ItemCategory';
import { EquipmentSlot } from './EquipmentSlot';
import { EquipmentStats } from './EquipmentStats';

export type EquipmentModel = Readonly<{
  id: string;
  name: string;
  itemCategory: ItemCategory;
  level?: number | null;
  mapIcon: string;
  paletteSwaps: {
    [key: string]: string;
  };
  /**
   * between 1 and 5, where 5 is most rare, or null if this should never be randomly generated
   */
  rarity?: number | null;
  ability?: string;
  script?: string;
  slot: EquipmentSlot;
  sprite: string;
  stats: EquipmentStats;
  tooltip?: string;
}>;
