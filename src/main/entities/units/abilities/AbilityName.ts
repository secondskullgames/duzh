export enum AbilityName {
  ATTACK = 'ATTACK',
  BLINK = 'BLINK',
  BOLT = 'BOLT',
  DASH = 'DASH',
  DASH_ATTACK = 'DASH_ATTACK',
  DOUBLE_DASH_ATTACK = 'DOUBLE_DASH_ATTACK',
  FREE_MOVE = 'FREE_MOVE',
  HEAVY_ATTACK = 'HEAVY_ATTACK',
  KNOCKBACK_ATTACK = 'KNOCKBACK_ATTACK',
  MINOR_KNOCKBACK = 'MINOR_KNOCKBACK',
  MINOR_STUN_ATTACK = 'MINOR_STUN_ATTACK',
  PIERCE = 'PIERCE',
  SHOOT_ARROW = 'SHOOT_ARROW',
  SHOOT_FIREBALL = 'SHOOT_FIREBALL',
  SHOOT_TURRET_ARROW = 'SHOOT_TURRET_ARROW',
  STRAFE = 'STRAFE',
  STRAFE_SHOT = 'STRAFE_SHOT',
  STUN_ATTACK = 'STUN_ATTACK',
  SUMMON = 'SUMMON',
  TELEPORT = 'TELEPORT'
}

export namespace AbilityName {
  export const values = (): AbilityName[] => [
    AbilityName.ATTACK,
    AbilityName.BLINK,
    AbilityName.BOLT,
    AbilityName.DASH,
    AbilityName.DASH_ATTACK,
    AbilityName.HEAVY_ATTACK,
    AbilityName.KNOCKBACK_ATTACK,
    AbilityName.MINOR_KNOCKBACK,
    AbilityName.MINOR_STUN_ATTACK,
    AbilityName.PIERCE,
    AbilityName.SHOOT_ARROW,
    AbilityName.SHOOT_FIREBALL,
    AbilityName.STRAFE,
    AbilityName.STUN_ATTACK,
    AbilityName.SUMMON,
    AbilityName.TELEPORT
  ];

  /**
   * TODO should probably be a field on UnitAbility
   */
  export const getInnateAbilities = (): AbilityName[] => [
    AbilityName.ATTACK,
    AbilityName.SHOOT_ARROW
  ];
}
