
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

const _map: Record<AbilityName, UnitAbility> = {
  [AbilityName.ATTACK]: NormalAttack,
  [AbilityName.HEAVY_ATTACK]: HeavyAttack,
  [AbilityName.KNOCKBACK_ATTACK]: KnockbackAttack,
  [AbilityName.STUN_ATTACK]: StunAttack,
  [AbilityName.SHOOT_ARROW]: ShootArrow,
  [AbilityName.DASH]: Dash,
  [AbilityName.TELEPORT]: Teleport,
  [AbilityName.SUMMON]: Summon,
  [AbilityName.BOLT]: Bolt,
  [AbilityName.STRAFE]: Strafe,
  [AbilityName.PIERCE]: PiercingAttack
};

export const abilityForName = (name: AbilityName): UnitAbility => {
  const ability = _map[name];
  checkNotNull(ability, `Unknown ability ${name}`);
  return ability;
};