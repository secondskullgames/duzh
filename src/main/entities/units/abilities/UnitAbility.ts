import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import ImageFactory from '../../../graphics/images/ImageFactory';
import { AbilityName } from './AbilityName';

export type UnitAbilityContext = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export type UnitAbility = Readonly<{
  name: AbilityName,
  manaCost: number,
  icon: string | null,

  use: (
    unit: Unit,
    coordinates: Coordinates | null,
    { state }: UnitAbilityContext
  ) => Promise<void>;
}>;
