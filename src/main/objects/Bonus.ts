import GameObject, { ObjectType } from './GameObject';
import Unit from '../units/Unit';
import Sprite from '@main/graphics/sprites/Sprite';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';

type Props = Readonly<{
  name: string;
  coordinates: Coordinates;
  map: MapInstance;
  sprite: Sprite;
  onUse: (unit: Unit) => Promise<void>;
}>;

export default class Bonus extends GameObject {
  readonly onUse: (unit: Unit) => Promise<void>;

  constructor({ name, coordinates, map, sprite, onUse }: Props) {
    super({
      name,
      coordinates,
      objectType: ObjectType.BONUS,
      sprite,
      map
    });
    this.onUse = onUse;
  }

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => false;
}
