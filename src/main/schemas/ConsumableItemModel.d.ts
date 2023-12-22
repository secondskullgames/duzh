import ConsumableType from './ConsumableType';

type ConsumableItemModel = {
  id: string;
  level: number | null;
  points: number | null;
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
