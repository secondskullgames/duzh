import { checkNotNull } from '../../../utils/preconditions';
import { type UnitAbility } from './UnitAbility';
import { ShootBolt } from './ShootBolt';
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
import { AbilityName } from './AbilityName';
import { MinorStunAttack } from './MinorStunAttack';

const _map: Record<AbilityName, UnitAbility> = {
  [AbilityName.ATTACK]: NormalAttack,
  [AbilityName.BOLT]: ShootBolt,
  [AbilityName.DASH]: Dash,
  [AbilityName.HEAVY_ATTACK]: HeavyAttack,
  [AbilityName.KNOCKBACK_ATTACK]: KnockbackAttack,
  [AbilityName.MINOR_STUN_ATTACK]: MinorStunAttack,
  [AbilityName.PIERCE]: PiercingAttack,
  [AbilityName.SHOOT_ARROW]: ShootArrow,
  [AbilityName.STRAFE]: Strafe,
  [AbilityName.STUN_ATTACK]: StunAttack,
  [AbilityName.SUMMON]: Summon,
  [AbilityName.TELEPORT]: Teleport
};

export const abilityForName = (name: AbilityName): UnitAbility => {
  const ability = _map[name];
  checkNotNull(ability, `Unknown ability ${name}`);
  return ability;
};