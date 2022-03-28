import Sprite from '../graphics/sprites/Sprite';
import Entity from '../types/Entity';
import InventoryItem from '../items/InventoryItem';

type Props = {
  x: number,
  y: number,
  sprite: Sprite,
  inventoryItem: InventoryItem
};

class MapItem implements Entity {
  x: number;
  y: number;
  private readonly sprite: Sprite;
  inventoryItem: InventoryItem;

  constructor({ x, y, sprite, inventoryItem }: Props) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.inventoryItem = inventoryItem;
  }

  getSprite = () => this.sprite;
  update = async () => {};
}

export default MapItem;
