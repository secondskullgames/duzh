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
import { Scorpion } from './Scorpion';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { checkNotNull } from '../../../utils/preconditions';

export interface UnitAbility {
  readonly name: AbilityName;
  readonly manaCost: number;
  readonly icon: string | null;

  use: (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => Promise<void>;
}

export namespace UnitAbility {
  const _map: Record<AbilityName, UnitAbility> = {
    [AbilityName.ATTACK]: new NormalAttack(),
    [AbilityName.BLINK]: new Blink(),
    [AbilityName.BOLT]: new ShootBolt(),
    [AbilityName.DASH]: new Dash(),
    [AbilityName.DASH_ATTACK]: new DashAttack(),
    [AbilityName.DOUBLE_DASH_ATTACK]: new DoubleDashAttack(),
    [AbilityName.FREE_MOVE]: new FreeMove(),
    [AbilityName.HEAVY_ATTACK]: new HeavyAttack(),
    [AbilityName.KNOCKBACK_ATTACK]: new KnockbackAttack(),
    [AbilityName.MINOR_KNOCKBACK]: new MinorKnockback(),
    [AbilityName.MINOR_STUN_ATTACK]: new MinorStunAttack(),
    [AbilityName.PIERCE]: new PiercingAttack(),
    [AbilityName.SCORPION]: new Scorpion(),
    [AbilityName.SHOOT_ARROW]: new ShootArrow(),
    [AbilityName.SHOOT_TURRET_ARROW]: new ShootTurretArrow(),
    [AbilityName.SHOOT_FIREBALL]: new ShootFireball(),
    [AbilityName.STRAFE]: new Strafe(),
    [AbilityName.STRAFE_SHOT]: new StrafeShot(),
    [AbilityName.STUN_ATTACK]: new StunAttack(),
    [AbilityName.SUMMON]: new Summon(),
    [AbilityName.TELEPORT]: new Teleport()
  };

  export const abilityForName = (name: AbilityName): UnitAbility => {
    const ability = _map[name];
    checkNotNull(ability, `Unknown ability ${name}`);
    return ability;
  };
}
