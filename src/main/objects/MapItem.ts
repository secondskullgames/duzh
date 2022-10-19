import Sprite from '../graphics/sprites/Sprite';
import Entity from '../types/Entity';
import InventoryItem from '../items/InventoryItem';
import Coordinates from '../geometry/Coordinates';

type Props = {
  x: number,
  y: number,
  sprite: Sprite,
  inventoryItem: InventoryItem
};

class MapItem implements Entity {
  private x: number;
  private y: number;
  private readonly sprite: Sprite;
  inventoryItem: InventoryItem;

  constructor({ x, y, sprite, inventoryItem }: Props) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.inventoryItem = inventoryItem;
  }

  getCoordinates = (): Coordinates => ({ x: this.x, y: this.y });
  getSprite = () => this.sprite;
  update = async () => {};
}

export default MapItem;
