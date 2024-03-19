import GameObject, { ObjectType } from './GameObject';
import Sprite from '@main/graphics/sprites/Sprite';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';

type Props = Readonly<{
  coordinates: Coordinates;
  map: MapInstance;
  sprite: Sprite;
  movable: boolean;
}>;

export default class Block extends GameObject {
  private readonly movable: boolean;

  constructor({ coordinates, map, sprite, movable }: Props) {
    super({
      coordinates,
      map,
      objectType: ObjectType.BLOCK,
      sprite
    });
    this.movable = movable;
  }

  /** @override {@link Entity#update} */
  playTurnAction = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => true;

  isMovable = (): boolean => this.movable;
}
