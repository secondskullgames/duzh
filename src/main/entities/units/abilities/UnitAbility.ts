import { AbilityName } from './AbilityName';
import { NormalAttack } from './NormalAttack';
import { Blink } from './Blink';
import { ShootBolt } from './ShootBolt';
import { Dash } from './Dash';
import { DashAttack } from './DashAttack';
import { FreeMove } from './FreeMove';
import { HeavyAttack } from './HeavyAttack';
import { KnockbackAttack } from './KnockbackAttack';
import { MinorKnockback } from './MinorKnockback';
import { MinorStunAttack } from './MinorStunAttack';
import { PiercingAttack } from './PiercingAttack';
import { ShootArrow } from './ShootArrow';
import { ShootTurretArrow } from './ShootTurretArrow';
import { ShootFireball } from './ShootFireball';
import { Strafe } from './Strafe';
import { StrafeShot } from './StrafeShot';
import { StunAttack } from './StunAttack';
import { Summon } from './Summon';
import { Teleport } from './Teleport';
import { Scorpion } from './Scorpion';
import { Cleave } from './Cleave';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { checkNotNull } from '../../../utils/preconditions';

export type UnitAbility = Readonly<{
  name: AbilityName;
  manaCost: number;
  icon: string | null;
  /**
   * True if the ability does not show up on the player's action bar
   */
  innate: boolean;

  /**
   * TODO: should accept a direction, not coordinates
   */
  use: (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => Promise<void>;
}>;

export namespace UnitAbility {
  const _map: Record<AbilityName, UnitAbility> = {
    [AbilityName.ATTACK]: NormalAttack,
    [AbilityName.BLINK]: Blink,
    [AbilityName.BOLT]: ShootBolt,
    [AbilityName.CLEAVE]: Cleave,
    [AbilityName.DASH]: Dash,
    [AbilityName.DASH_ATTACK]: DashAttack,
    [AbilityName.FREE_MOVE]: FreeMove,
    [AbilityName.HEAVY_ATTACK]: HeavyAttack,
    [AbilityName.KNOCKBACK_ATTACK]: KnockbackAttack,
    [AbilityName.MINOR_KNOCKBACK]: MinorKnockback,
    [AbilityName.MINOR_STUN_ATTACK]: MinorStunAttack,
    [AbilityName.PIERCE]: PiercingAttack,
    [AbilityName.SCORPION]: Scorpion,
    [AbilityName.SHOOT_ARROW]: ShootArrow,
    [AbilityName.SHOOT_TURRET_ARROW]: ShootTurretArrow,
    [AbilityName.SHOOT_FIREBALL]: ShootFireball,
    [AbilityName.STRAFE]: Strafe,
    [AbilityName.STRAFE_SHOT]: StrafeShot,
    [AbilityName.STUN_ATTACK]: StunAttack,
    [AbilityName.SUMMON]: Summon,
    [AbilityName.TELEPORT]: Teleport
  };

  export const abilityForName = (name: AbilityName): UnitAbility => {
    const ability = _map[name];
    checkNotNull(ability, `Unknown ability ${name}`);
    return ability;
  };
}
