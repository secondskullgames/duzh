import Sprite from '../graphics/sprites/Sprite';
import Entity from '../entities/Entity';
import InventoryItem from '../items/InventoryItem';
import Coordinates from '../geometry/Coordinates';

type Props = Readonly<{
  x: number,
  y: number,
  sprite: Sprite,
  inventoryItem: InventoryItem
}>;

export default class MapItem implements Entity {
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

  /** @override */
  getCoordinates = (): Coordinates => ({ x: this.x, y: this.y });

  /** @override */
  getSprite = () => this.sprite;

  /** @override */
  update = async () => {};

  /** @override */
  isBlocking = (): boolean => false;
}
