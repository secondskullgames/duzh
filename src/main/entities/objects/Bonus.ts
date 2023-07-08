import GameObject, { ObjectType } from './GameObject';
import Coordinates from '../../geometry/Coordinates';
import Sprite from '../../graphics/sprites/Sprite';
import Unit from '../units/Unit';
import GameState from '../../core/GameState';
import Ticker from '../../core/Ticker';
import MapInstance from '../../maps/MapInstance';

export type OnUseContext = Readonly<{
  state: GameState,
  map: MapInstance,
  ticker: Ticker
}>;

type Props = Readonly<{
  coordinates: Coordinates,
  sprite: Sprite,
  onUse: (unit: Unit, context: OnUseContext) => Promise<void>;
}>;

export default class Bonus extends GameObject {
  private readonly _onUse: (unit: Unit, { state }: OnUseContext) => Promise<void>;

  constructor({ coordinates, sprite, onUse }: Props) {
    super({
      coordinates,
      objectType: ObjectType.BONUS,
      sprite
    });
    this._onUse = onUse;
  }

  /** @override {@link Entity#update} */
  update = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => false;

  onUse = async (unit: Unit, context: OnUseContext): Promise<void> => {
    await this._onUse(unit, context);
  };
}
