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
import { DoubleDashAttack } from './DoubleDashAttack';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { checkNotNull } from '../../../utils/preconditions';

export type UnitAbility = Readonly<{
  name: AbilityName;
  manaCost: number;
  icon: string | null;

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
    [AbilityName.DASH]: Dash,
    [AbilityName.DASH_ATTACK]: DashAttack,
    [AbilityName.DOUBLE_DASH_ATTACK]: DoubleDashAttack,
    [AbilityName.FREE_MOVE]: FreeMove,
    [AbilityName.HEAVY_ATTACK]: HeavyAttack,
    [AbilityName.KNOCKBACK_ATTACK]: KnockbackAttack,
    [AbilityName.MINOR_KNOCKBACK]: MinorKnockback,
    [AbilityName.MINOR_STUN_ATTACK]: MinorStunAttack,
    [AbilityName.PIERCE]: PiercingAttack,
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
