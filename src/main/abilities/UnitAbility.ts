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
import { StunAttack } from './StunAttack';
import { Summon } from './Summon';
import { Teleport } from './Teleport';
import { Scorpion } from './Scorpion';
import { Cleave } from './Cleave';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { checkNotNull } from '@lib/utils/preconditions';
import { BurningAttack } from '@main/abilities/BurningAttack';
import { FastTeleport } from '@main/abilities/FastTeleport';
import { ShootFrostbolt } from '@main/abilities/ShootFrostbolt';

/**
 * Currently, a UnitAbility can really be one of three things:
 * 1. A player ability that shows up on the action bar like Heavy Attack
 *    (or an NPC-only ability like Teleport)
 * 2. An effect from a scroll (like Floor Fire)
 * 3. An effect from an item (like the Bolt Sword effect)
 *
 * Arguably we should decouple these
 */
export type UnitAbility = Readonly<{
  name: AbilityName;
  manaCost: number;
  icon: string | null;
  /**
   * True if the ability does not show up on the player's action bar
   */
  innate: boolean;

  isEnabled: (unit: Unit) => boolean;

  use: (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => Promise<void>;
}>;

export namespace UnitAbility {
  const _map: Record<AbilityName, UnitAbility> = {
    [AbilityName.ATTACK]: NormalAttack,
    [AbilityName.BLINK]: Blink,
    [AbilityName.BOLT]: ShootBolt,
    [AbilityName.BURNING_ATTACK]: BurningAttack,
    [AbilityName.CLEAVE]: Cleave,
    [AbilityName.DASH]: Dash,
    [AbilityName.DASH_ATTACK]: DashAttack,
    [AbilityName.FAST_TELEPORT]: FastTeleport,
    [AbilityName.FREE_MOVE]: FreeMove,
    [AbilityName.HEAVY_ATTACK]: HeavyAttack,
    [AbilityName.KNOCKBACK_ATTACK]: KnockbackAttack,
    [AbilityName.MINOR_KNOCKBACK]: MinorKnockback,
    [AbilityName.MINOR_STUN_ATTACK]: MinorStunAttack,
    [AbilityName.PIERCE]: PiercingAttack,
    [AbilityName.SCORPION]: Scorpion,
    [AbilityName.SHOOT_ARROW]: ShootArrow,
    [AbilityName.SHOOT_FROSTBOLT]: ShootFrostbolt,
    [AbilityName.SHOOT_TURRET_ARROW]: ShootTurretArrow,
    [AbilityName.SHOOT_FIREBALL]: ShootFireball,
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
}
