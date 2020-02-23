import Entity from '../types/Entity';
import InventoryItem from './InventoryItem';
import Sprite from './Sprite';

class MapItem implements Entity {
  x: number;
  y: number;
  readonly char: string;
  readonly sprite: Sprite;
  item?: InventoryItem;

  constructor({ x, y }, char: string, sprite: Sprite, item?: InventoryItem) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.sprite = sprite;
    this.item = item;
  }

  getInventoryItem(): InventoryItem {
    return this.item;
  }
}

export default MapItem;