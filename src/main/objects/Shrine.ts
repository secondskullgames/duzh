import GameObject, { ObjectType } from './GameObject';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import DynamicSprite from '@main/graphics/sprites/DynamicSprite';

type Props = Readonly<{
  name: string;
  coordinates: Coordinates;
  map: MapInstance;
  sprite: DynamicSprite<Shrine>;
  onUse: () => void;
}>;

export default class Shrine extends GameObject {
  private _isDepleted: boolean;
  private readonly onUse: () => void;

  constructor({ name, coordinates, map, sprite, onUse }: Props) {
    super({
      name,
      coordinates,
      map,
      objectType: ObjectType.SHRINE,
      sprite
    });
    sprite.bind(this);
    this.onUse = onUse;
    this._isDepleted = false;
  }

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => true;

  isDepleted = (): boolean => this._isDepleted;

  use = (): void => {
    if (!this._isDepleted) {
      this.onUse();
      this._isDepleted = true;
    }
  };
}
