
import { checkNotNull } from '../../../utils/preconditions';
import { AbilityName, type UnitAbility } from './UnitAbility';
import { Bolt } from './Bolt';
import { Dash } from './Dash';
import { HeavyAttack } from './HeavyAttack';
import { KnockbackAttack } from './KnockbackAttack';
import { NormalAttack } from './NormalAttack';
import { StunAttack } from './StunAttack';
import { PiercingAttack } from './PiercingAttack';
import { ShootArrow } from './ShootArrow';
import { Strafe } from './Strafe';
import { Summon } from './Summon';
import { Teleport } from './Teleport';

export namespace UnitAbilities {
  export const ATTACK: UnitAbility = NormalAttack;
  export const HEAVY_ATTACK: UnitAbility = HeavyAttack;
  export const KNOCKBACK_ATTACK: UnitAbility = KnockbackAttack;
  export const STUN_ATTACK: UnitAbility = StunAttack;
  export const SHOOT_ARROW: UnitAbility = ShootArrow;
  export const DASH: UnitAbility = Dash;
  export const TELEPORT: UnitAbility = Teleport;
  export const SUMMON: UnitAbility = Summon;
  export const BOLT: UnitAbility = Bolt;
  export const STRAFE: UnitAbility = Strafe;
  export const PIERCE: UnitAbility = PiercingAttack;

  export const abilityForName = (name: AbilityName): UnitAbility => {
    const ability = UnitAbilities[name];
    checkNotNull(ability, `Unknown ability ${name}`);
    return ability;
  };
}