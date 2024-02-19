export enum AbilityName {
  ATTACK = 'ATTACK',
  BLINK = 'BLINK',
  BOLT = 'BOLT',
  DASH = 'DASH',
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
    AbilityName.HEAVY_ATTACK,
    AbilityName.KNOCKBACK_ATTACK,
    AbilityName.MINOR_STUN_ATTACK,
    AbilityName.PIERCE,
    AbilityName.SHOOT_ARROW,
    AbilityName.SHOOT_FIREBALL,
    AbilityName.STRAFE,
    AbilityName.STUN_ATTACK,
    AbilityName.SUMMON,
    AbilityName.TELEPORT
  ];

  export const getInnateAbilities = (): AbilityName[] => [
    AbilityName.ATTACK,
    AbilityName.SHOOT_ARROW
  ];
}
