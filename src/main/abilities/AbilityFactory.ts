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
import { Engine } from '@main/core/Engine';
import { inject, injectable } from 'inversify';

@injectable()
export class AbilityFactory {
  private readonly _map: Record<AbilityName, UnitAbility>;

  constructor(
    @inject(Engine)
    private readonly engine: Engine
  ) {
    this._map = {
      [AbilityName.ATTACK]: new NormalAttack(this.engine),
      [AbilityName.BLINK]: new Blink(this.engine),
      [AbilityName.BOLT]: new ShootBolt(this.engine),
      [AbilityName.BURNING_ATTACK]: new BurningAttack(this.engine),
      [AbilityName.CLEAVE]: new Cleave(this.engine),
      [AbilityName.DASH]: new Dash(this.engine),
      [AbilityName.DASH_ATTACK]: new DashAttack(this.engine),
      [AbilityName.FAST_TELEPORT]: new FastTeleport(this.engine),
      [AbilityName.FREE_MOVE]: new FreeMove(this.engine),
      [AbilityName.HEAVY_ATTACK]: new HeavyAttack(this.engine),
      [AbilityName.KNOCKBACK_ATTACK]: new KnockbackAttack(this.engine),
      [AbilityName.MINOR_KNOCKBACK]: new MinorKnockback(this.engine),
      [AbilityName.MINOR_STUN_ATTACK]: new MinorStunAttack(this.engine),
      [AbilityName.PIERCE]: new PiercingAttack(this.engine),
      [AbilityName.SCORPION]: new Scorpion(this.engine),
      [AbilityName.SHOOT_ARROW]: new ShootArrow(this.engine),
      [AbilityName.SHOOT_FIREBALL]: new ShootFireball(this.engine),
      [AbilityName.SHOOT_FIREBOLT]: new ShootFirebolt(this.engine),
      [AbilityName.SHOOT_FROSTBOLT]: new ShootFrostbolt(this.engine),
      [AbilityName.SHOOT_TURRET_ARROW]: new ShootTurretArrow(this.engine),
      [AbilityName.STRAFE]: new Strafe(this.engine),
      [AbilityName.STUN_ATTACK]: new StunAttack(this.engine),
      [AbilityName.SUMMON]: new Summon(this.engine),
      [AbilityName.TELEPORT]: new Teleport(this.engine)
    };
  }

  abilityForName = (name: AbilityName): UnitAbility => {
    const ability = this._map[name];
    checkNotNull(ability, `Unknown ability ${name}`);
    return ability;
  };
}
