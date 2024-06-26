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
  onActivate: (thisShrine: Shrine, state: GameState, session: Session) => void;
}>;

export default class Shrine extends GameObject {
  private _isDepleted: boolean;
  private readonly _onActivate: (state: GameState, session: Session) => void;

  constructor({ name, coordinates, map, sprite, onActivate }: Props) {
    super({
      name,
      coordinates,
      map,
      objectType: ObjectType.SHRINE,
      sprite
    });
    sprite.bind(this);
    this._onActivate = (state, session) => onActivate(this, state, session);
    this._isDepleted = false;
  }

  /** @override {@link Entity#playTurnAction} */
  playTurnAction = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => true;

  isDepleted = (): boolean => this._isDepleted;

  onActivate = (state: GameState, session: Session): void => {
    if (!this._isDepleted) {
      this._onActivate(state, session);
    }
  };

  deplete = () => {
    this._isDepleted = true;
  };
}
