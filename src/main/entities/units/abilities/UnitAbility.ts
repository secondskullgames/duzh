import { AbilityName } from './AbilityName';
import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import ImageFactory from '../../../graphics/images/ImageFactory';
import Ticker from '../../../core/Ticker';
import MapInstance from '../../../maps/MapInstance';
import { Session } from '../../../core/Session';

export type UnitAbilityContext = Readonly<{
  state: GameState;
  session: Session;
  map: MapInstance;
  imageFactory: ImageFactory;
}>;

export type UnitAbility = Readonly<{
  name: AbilityName;
  manaCost: number;
  icon: string | null;

  use: (
    unit: Unit,
    coordinates: Coordinates | null,
    context: UnitAbilityContext
  ) => Promise<void>;
}>;
