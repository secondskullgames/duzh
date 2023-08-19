import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import ImageFactory from '../../../graphics/images/ImageFactory';
import { AbilityName } from './AbilityName';
import Ticker from '../../../core/Ticker';
import MapInstance from '../../../maps/MapInstance';
import SpriteFactory from '../../../graphics/sprites/SpriteFactory';

export type UnitAbilityContext = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  ticker: Ticker
}>;

export type UnitAbility = Readonly<{
  name: AbilityName,
  manaCost: number,
  icon: string | null,

  use: (
    unit: Unit,
    coordinates: Coordinates | null,
    context: UnitAbilityContext
  ) => Promise<void>;
}>;
