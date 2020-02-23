import InventoryItem from './InventoryItem';
import Sprite from './Sprite';
import { Coordinates, Entity } from '../types';

class MapItem implements Entity {
  x: number;
  y: number;
  readonly char: string;
  readonly sprite: Sprite;
  inventoryItem: InventoryItem;

  constructor({ x, y }: Coordinates, char: string, sprite: Sprite, inventoryItem: InventoryItem) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.sprite = sprite;
    this.inventoryItem = inventoryItem;
  }
}

export default MapItem;