import GameObject, { ObjectType } from './GameObject';
import Sprite from '../../graphics/sprites/Sprite';
import InventoryItem from '../../items/InventoryItem';
import Coordinates from '../../geometry/Coordinates';

type Props = Readonly<{
  coordinates: Coordinates,
  sprite: Sprite,
  inventoryItem: InventoryItem
}>;

export default class MapItem extends GameObject {
  readonly inventoryItem: InventoryItem;

  constructor({ coordinates, sprite, inventoryItem }: Props) {
    super({
      coordinates,
      objectType: ObjectType.ITEM,
      sprite
    });
    this.inventoryItem = inventoryItem;
  }

  /** @override */
  update = async () => {};

  /** @override */
  isBlocking = (): boolean => false;
}
