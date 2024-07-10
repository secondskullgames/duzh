import { AbilityName } from '@main/abilities/AbilityName';
import { NormalAttack } from '@main/abilities/NormalAttack';
import { Blink } from '@main/abilities/Blink';
import { ShootBolt } from '@main/abilities/ShootBolt';
import { BurningAttack } from '@main/abilities/BurningAttack';
import { Cleave } from '@main/abilities/Cleave';
import { Dash } from '@main/abilities/Dash';
import { DashAttack } from '@main/abilities/DashAttack';
import { FastTeleport } from '@main/abilities/FastTeleport';
import { FreeMove } from '@main/abilities/FreeMove';
import { HeavyAttack } from '@main/abilities/HeavyAttack';
import { KnockbackAttack } from '@main/abilities/KnockbackAttack';
import { MinorKnockback } from '@main/abilities/MinorKnockback';
import { MinorStunAttack } from '@main/abilities/MinorStunAttack';
import { PiercingAttack } from '@main/abilities/PiercingAttack';
import { Scorpion } from '@main/abilities/Scorpion';
import { ShootArrow } from '@main/abilities/ShootArrow';
import { ShootFireball } from '@main/abilities/ShootFireball';
import { ShootFirebolt } from '@main/abilities/ShootFirebolt';
import { ShootFrostbolt } from '@main/abilities/ShootFrostbolt';
import { ShootTurretArrow } from '@main/abilities/ShootTurretArrow';
import { Strafe } from '@main/abilities/Strafe';
import { StunAttack } from '@main/abilities/StunAttack';
import { Summon } from '@main/abilities/Summon';
import { Teleport } from '@main/abilities/Teleport';
import { checkNotNull } from '@lib/utils/preconditions';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { injectable } from 'inversify';

@injectable()
export class AbilityFactory {
  private readonly _map: Record<AbilityName, UnitAbility> = {
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

  abilityForName = (name: AbilityName): UnitAbility => {
    const ability = this._map[name];
    checkNotNull(ability, `Unknown ability ${name}`);
    return ability;
  };
}
