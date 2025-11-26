import GameObject, { ObjectType } from './GameObject';
import Sprite from '@main/graphics/sprites/Sprite';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@duzh/geometry';

type Props = Readonly<{
  name: string;
  coordinates: Coordinates;
  map: MapInstance;
  sprite: Sprite;
  movable: boolean;
}>;

export default class Block extends GameObject {
  private readonly movable: boolean;

  constructor({ name, coordinates, map, sprite, movable }: Props) {
    super({
      name,
      coordinates,
      map,
      objectType: ObjectType.BLOCK,
      sprite
    });
    this.movable = movable;
  }

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => true;

  isMovable = (): boolean => this.movable;
}
