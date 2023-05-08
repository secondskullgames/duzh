import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import ImageFactory from '../../../graphics/images/ImageFactory';
import { AbilityName } from './AbilityName';

export type UnitAbilityProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export type UnitAbility = Readonly<{
  name: AbilityName,
  manaCost: number,
  icon: string | null,

  use: (
    unit: Unit,
    coordinates: Coordinates | null,
    { state }: UnitAbilityProps
  ) => Promise<void>;

  getDamageLogMessage: (unit: Unit, target: Unit, damageTaken: number) => string;
}>;
