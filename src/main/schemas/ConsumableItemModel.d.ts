import ConsumableType from './ConsumableType';

type ConsumableItemModel = {
  id: string;
  name: string;
  level: number | null;
  /**
   * between 1 and 5, where 5 is most rare, or null if this should never be randomly generated
   */
  rarity: number | null;
  mapSprite: string;
  paletteSwaps?: {
    [key: string]: string;
  };
  type: ConsumableType;
  params?: {
    [key: string]: string;
  };
  tooltip?: string;
};

export default ConsumableItemModel;
