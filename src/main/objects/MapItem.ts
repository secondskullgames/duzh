import GameObject, { ObjectType } from './GameObject';
import Sprite from '@main/graphics/sprites/Sprite';
import InventoryItem from '@main/items/InventoryItem';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';

type Props = Readonly<{
  coordinates: Coordinates;
  map: MapInstance;
  sprite: Sprite;
  inventoryItem: InventoryItem;
}>;

export default class MapItem extends GameObject {
  readonly inventoryItem: InventoryItem;

  constructor({ coordinates, map, sprite, inventoryItem }: Props) {
    super({
      coordinates,
      map,
      objectType: ObjectType.ITEM,
      sprite
    });
    this.inventoryItem = inventoryItem;
  }

  /** @override */
  playTurnAction = async () => {};

  /** @override */
  isBlocking = (): boolean => false;
}
