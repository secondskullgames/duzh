import GameObject, { ObjectType } from './GameObject';
import MapInstance from '../../maps/MapInstance';
import { Sprite } from '@main/graphics/sprites';
import { Coordinates } from '@main/geometry';

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
