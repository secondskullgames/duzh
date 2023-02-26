import NormalAttack from './NormalAttack';
import HeavyAttack from './HeavyAttack';
import KnockbackAttack from './KnockbackAttack';
import StunAttack from './StunAttack';
import ShootArrow from './ShootArrow';
import Dash from './Dash';
import Teleport from './Teleport';
import Summon from './Summon';
import Bolt from './Bolt';
import Strafe from './Strafe';
import { checkNotNull } from '../../utils/preconditions';
import UnitAbility, { AbilityName } from './UnitAbility';
import PiercingAttack from './PiercingAttack';

export namespace UnitAbilities {
  export const ATTACK: UnitAbility = new NormalAttack();
  export const HEAVY_ATTACK: UnitAbility = new HeavyAttack();
  export const KNOCKBACK_ATTACK: UnitAbility = new KnockbackAttack();
  export const STUN_ATTACK: UnitAbility = new StunAttack();
  export const SHOOT_ARROW: UnitAbility = new ShootArrow();
  export const DASH: UnitAbility = new Dash();
  export const TELEPORT: Teleport = new Teleport();
  export const SUMMON: UnitAbility = new Summon();
  export const BOLT: UnitAbility = new Bolt();
  export const STRAFE: UnitAbility = new Strafe();
  export const PIERCE: UnitAbility = new PiercingAttack();

  export const abilityForName = (name: AbilityName): UnitAbility => {
    const ability = UnitAbilities[name];
    checkNotNull(ability, `Unknown ability ${name}`);
    return ability;
  };
}