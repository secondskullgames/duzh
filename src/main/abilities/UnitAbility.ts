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
  manaCost: number;
  readonly icon: string | null;
  /**
   * True if the ability does not show up on the player's action bar
   */
  readonly innate: boolean;

  isEnabled: (unit: Unit) => boolean;
  /**
   * Note - this doesn't check the ability's mana cost, you need to check
   * isEnabled in addition to this
   */
  isLegal: (unit: Unit, coordinates: Coordinates) => boolean;

  use: (unit: Unit, coordinates: Coordinates) => Promise<void>;
}

export namespace UnitAbility {
  export const createAbilityForName = (name: AbilityName): UnitAbility => {
    switch (name) {
      case AbilityName.ATTACK:
        return new NormalAttack();
      case AbilityName.BLINK:
        return new Blink();
      case AbilityName.BOLT:
        return new ShootBolt();
      case AbilityName.BURNING_ATTACK:
        return new BurningAttack();
      case AbilityName.CLEAVE:
        return new Cleave();
      case AbilityName.DASH:
        return new Dash();
      case AbilityName.DASH_ATTACK:
        return new DashAttack();
      case AbilityName.FAST_TELEPORT:
        return new FastTeleport();
      case AbilityName.FREE_MOVE:
        return new FreeMove();
      case AbilityName.HEAVY_ATTACK:
        return new HeavyAttack();
      case AbilityName.KNOCKBACK_ATTACK:
        return new KnockbackAttack();
      case AbilityName.MINOR_KNOCKBACK:
        return new MinorKnockback();
      case AbilityName.MINOR_STUN_ATTACK:
        return new MinorStunAttack();
      case AbilityName.PIERCE:
        return new PiercingAttack();
      case AbilityName.SCORPION:
        return new Scorpion();
      case AbilityName.SHOOT_ARROW:
        return new ShootArrow();
      case AbilityName.SHOOT_FIREBALL:
        return new ShootFireball();
      case AbilityName.SHOOT_FIREBOLT:
        return new ShootFirebolt();
      case AbilityName.SHOOT_FROSTBOLT:
        return new ShootFrostbolt();
      case AbilityName.SHOOT_TURRET_ARROW:
        return new ShootTurretArrow();
      case AbilityName.STRAFE:
        return new Strafe();
      case AbilityName.STUN_ATTACK:
        return new StunAttack();
      case AbilityName.SUMMON:
        return new Summon();
      case AbilityName.TELEPORT:
        return new Teleport();
      default:
        throw new Error(`Unknown ability ${name}`);
    }
  };
}
