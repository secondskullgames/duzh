import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import GameRenderer from '../../../graphics/renderers/GameRenderer';

export enum AbilityName {
  ATTACK = 'ATTACK',
  HEAVY_ATTACK = 'HEAVY_ATTACK',
  KNOCKBACK_ATTACK = 'KNOCKBACK_ATTACK',
  STUN_ATTACK = 'STUN_ATTACK',
  SHOOT_ARROW = 'SHOOT_ARROW',
  DASH = 'DASH',
  TELEPORT = 'TELEPORT',
  SUMMON = 'SUMMON',
  BOLT = 'BOLT',
  STRAFE = 'STRAFE',
  PIERCE = 'PIERCE'
}

type Props = Readonly<{
  name: string,
  manaCost: number,
  icon?: string | null
}>;

export type UnitAbilityProps = Readonly<{
  state: GameState,
  renderer: GameRenderer
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
