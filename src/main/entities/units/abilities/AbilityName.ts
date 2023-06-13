export enum AbilityName {
  ATTACK = 'ATTACK',
  BOLT = 'BOLT',
  DASH = 'DASH',
  HEAVY_ATTACK = 'HEAVY_ATTACK',
  KNOCKBACK_ATTACK = 'KNOCKBACK_ATTACK',
  MINOR_STUN_ATTACK = 'MINOR_STUN_ATTACK',
  PIERCE = 'PIERCE',
  SHOOT_ARROW = 'SHOOT_ARROW',
  STRAFE = 'STRAFE',
  STUN_ATTACK = 'STUN_ATTACK',
  SUMMON = 'SUMMON',
  TELEPORT = 'TELEPORT'
}

export namespace AbilityName {
  export const values = (): AbilityName[] => [
    AbilityName.ATTACK,
    AbilityName.BOLT,
    AbilityName.DASH,
    AbilityName.HEAVY_ATTACK,
    AbilityName.KNOCKBACK_ATTACK,
    AbilityName.MINOR_STUN_ATTACK,
    AbilityName.PIERCE,
    AbilityName.SHOOT_ARROW,
    AbilityName.STRAFE,
    AbilityName.STUN_ATTACK,
    AbilityName.SUMMON,
    AbilityName.TELEPORT
  ];
}