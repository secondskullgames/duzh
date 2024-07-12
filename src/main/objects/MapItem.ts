import GameObject, { ObjectType } from './GameObject';
import Sprite from '@main/graphics/sprites/Sprite';
import InventoryItem from '@main/items/InventoryItem';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';

type Props = Readonly<{
  name: string;
  coordinates: Coordinates;
  map: MapInstance;
  sprite: Sprite;
  inventoryItem: InventoryItem;
}>;

export default class MapItem extends GameObject {
  readonly inventoryItem: InventoryItem;

  constructor({ name, coordinates, map, sprite, inventoryItem }: Props) {
    super({
      name,
      coordinates,
      map,
      objectType: ObjectType.ITEM,
      sprite
    });
    this.inventoryItem = inventoryItem;
  }

  /** @override */
  isBlocking = (): boolean => false;
}
