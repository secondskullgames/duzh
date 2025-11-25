import GameObject, { ObjectType } from './GameObject';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@duzh/geometry';
import DynamicSprite from '@main/graphics/sprites/DynamicSprite';
import { Game } from '@main/core/Game';

type Props = Readonly<{
  name: string;
  coordinates: Coordinates;
  map: MapInstance;
  sprite: DynamicSprite<Shrine>;
  onUse: (game: Game) => void;
}>;

export default class Shrine extends GameObject {
  private _isDepleted: boolean;
  private readonly onUse: (game: Game) => void;

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

  use = (game: Game): void => {
    if (!this._isDepleted) {
      this.onUse(game);
      this._isDepleted = true;
    }
  };
}
