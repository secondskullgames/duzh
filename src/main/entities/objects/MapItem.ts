import Sprite from '../../graphics/sprites/Sprite';
import InventoryItem from '../../items/InventoryItem';
import GameObject from './GameObject';

type Props = Readonly<{
  x: number,
  y: number,
  sprite: Sprite,
  inventoryItem: InventoryItem
}>;

export default class MapItem extends GameObject {
  readonly inventoryItem: InventoryItem;

  constructor({ x, y, sprite, inventoryItem }: Props) {
    super({
      coordinates: { x, y },
      objectType: 'item',
      sprite
    });
    this.inventoryItem = inventoryItem;
  }

  /** @override */
  update = async () => {};

  /** @override */
  isBlocking = (): boolean => false;
}
