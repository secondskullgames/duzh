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
import { ShootFirebolt } from '@main/abilities/ShootFirebolt';

/**
 * Currently, a UnitAbility can really be one of three things:
 * 1. A player ability that shows up on the action bar like Heavy Attack
 *    (or an NPC-only ability like Teleport)
 * 2. An effect from a scroll (like Floor Fire)
 * 3. An effect from an item (like the Bolt Sword effect)
 *
 * Arguably we should decouple these
 */
export interface UnitAbility {
  readonly name: AbilityName;
  readonly manaCost: number;
  readonly icon: string | null;
  /**
   * True if the ability does not show up on the player's action bar
   */
  readonly innate: boolean;

  isEnabled: (unit: Unit) => boolean;

  use: (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => Promise<void>;
}

export namespace UnitAbility {
  const _map: Record<AbilityName, UnitAbility> = {
    [AbilityName.ATTACK]: new NormalAttack(),
    [AbilityName.BLINK]: new Blink(),
    [AbilityName.BOLT]: new ShootBolt(),
    [AbilityName.BURNING_ATTACK]: new BurningAttack(),
    [AbilityName.CLEAVE]: new Cleave(),
    [AbilityName.DASH]: new Dash(),
    [AbilityName.DASH_ATTACK]: new DashAttack(),
    [AbilityName.FAST_TELEPORT]: new FastTeleport(),
    [AbilityName.FREE_MOVE]: new FreeMove(),
    [AbilityName.HEAVY_ATTACK]: new HeavyAttack(),
    [AbilityName.KNOCKBACK_ATTACK]: new KnockbackAttack(),
    [AbilityName.MINOR_KNOCKBACK]: new MinorKnockback(),
    [AbilityName.MINOR_STUN_ATTACK]: new MinorStunAttack(),
    [AbilityName.PIERCE]: new PiercingAttack(),
    [AbilityName.SCORPION]: new Scorpion(),
    [AbilityName.SHOOT_ARROW]: new ShootArrow(),
    [AbilityName.SHOOT_FIREBALL]: new ShootFireball(),
    [AbilityName.SHOOT_FIREBOLT]: new ShootFirebolt(),
    [AbilityName.SHOOT_FROSTBOLT]: new ShootFrostbolt(),
    [AbilityName.SHOOT_TURRET_ARROW]: new ShootTurretArrow(),
    [AbilityName.STRAFE]: new Strafe(),
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
