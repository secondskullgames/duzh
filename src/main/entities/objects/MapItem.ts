import Sprite from '../../graphics/sprites/Sprite';
import InventoryItem from '../../items/InventoryItem';
import Object from './Object';

type Props = Readonly<{
  x: number,
  y: number,
  sprite: Sprite,
  inventoryItem: InventoryItem
}>;

export default class MapItem extends Object {
  readonly inventoryItem: InventoryItem;

  constructor({ x, y, sprite, inventoryItem }: Props) {
    super({
      coordinates: { x, y },
      sprite
    });
    this.inventoryItem = inventoryItem;
  }

  /** @override */
  update = async () => {};

  /** @override */
  isBlocking = (): boolean => false;
}
