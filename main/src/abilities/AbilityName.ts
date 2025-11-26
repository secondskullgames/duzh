export enum AbilityName {
  ATTACK = 'ATTACK',
  BLINK = 'BLINK',
  BOLT = 'BOLT',
  BURNING_ATTACK = 'BURNING_ATTACK',
  CLEAVE = 'CLEAVE',
  DASH = 'DASH',
  DASH_ATTACK = 'DASH_ATTACK',
  FAST_TELEPORT = 'FAST_TELEPORT',
  FREE_MOVE = 'FREE_MOVE',
  HEAVY_ATTACK = 'HEAVY_ATTACK',
  KNOCKBACK_ATTACK = 'KNOCKBACK_ATTACK',
  MINOR_KNOCKBACK = 'MINOR_KNOCKBACK',
  MINOR_STUN_ATTACK = 'MINOR_STUN_ATTACK',
  PIERCE = 'PIERCE',
  SCORPION = 'SCORPION',
  SHOOT_ARROW = 'SHOOT_ARROW',
  SHOOT_FIREBALL = 'SHOOT_FIREBALL',
  SHOOT_FIREBOLT = 'SHOOT_FIREBOLT',
  SHOOT_FROSTBOLT = 'SHOOT_FROSTBOLT',
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
    AbilityName.BURNING_ATTACK,
    AbilityName.CLEAVE,
    AbilityName.DASH,
    AbilityName.DASH_ATTACK,
    AbilityName.HEAVY_ATTACK,
    AbilityName.KNOCKBACK_ATTACK,
    AbilityName.MINOR_KNOCKBACK,
    AbilityName.MINOR_STUN_ATTACK,
    AbilityName.PIERCE,
    AbilityName.SHOOT_ARROW,
    AbilityName.SHOOT_FIREBALL,
    AbilityName.SHOOT_FIREBOLT,
    AbilityName.STRAFE,
    AbilityName.STUN_ATTACK,
    AbilityName.SUMMON,
    AbilityName.TELEPORT
  ];

  /** @return a human-readable version of the ability name.
   * For example, HEAVY_ATTACK -> "Heavy Attack"
   */
  export const localize = (name: AbilityName): string => {
    const words = name.toLowerCase().split('_');
    const capitalizedWords = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return capitalizedWords.join(' ');
  };
}
