import Sprite from './Sprite';
import InventoryItem from './InventoryItem';

interface MapItem {
  x: number;
  y: number;
  char: string;
  sprite: Sprite;
  inventoryItem: () => InventoryItem
}

export default MapItem;