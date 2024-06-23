export enum Feature {
  // Note: Only one ALT_ feature should be enabled at any one time.
  // They don't work together and the precedence is undefined.
  ALT_DASH = 'ALT_DASH',
  ALT_STRAFE = 'ALT_STRAFE',
  ALT_TURN = 'ALT_TURN',
  BLINK_THROUGH_WALLS = 'BLINK_THROUGH_WALLS',
  BUSY_INDICATOR = 'BUSY_INDICATOR',
  DARK_DUNGEON = 'DARK_DUNGEON',
  DEBUG_BUTTONS = 'DEBUG_BUTTONS',
  DEBUG_LEVEL = 'DEBUG_LEVEL',
  DEBUG_LOGGING = 'DEBUG_LOGGING',
  DEDUPLICATE_EQUIPMENT = 'DEDUPLICATE_EQUIPMENT',
  FOG_SHADES = 'FOG_SHADES',
  FOG_SHADES_EVERYWHERE = 'FOG_SHADES_EVERYWHERE',
  FORCE_BRONZE_SWORD = 'FORCE_BRONZE_SWORD',
  GOD_MODE = 'GOD_MODE',
  LEVEL_UP_SCREEN = 'LEVEL_UP_SCREEN',
  HUD_BARS = 'HUD_BARS',
  SHRINES = 'SHRINES',
  STAIRS_UP = 'STAIRS_UP',
  TITLE_MUSIC = 'TITLE_MUSIC'
}

export namespace Feature {
  const ENABLED_FEATURES: Record<Feature, boolean> = {
    [Feature.ALT_DASH]: true,
    [Feature.ALT_STRAFE]: false,
    [Feature.ALT_TURN]: false,
    [Feature.BLINK_THROUGH_WALLS]: false,
    [Feature.BUSY_INDICATOR]: true,
    [Feature.DARK_DUNGEON]: false,
    [Feature.DEBUG_BUTTONS]: false,
    [Feature.DEBUG_LEVEL]: false,
    [Feature.DEDUPLICATE_EQUIPMENT]: true,
    [Feature.DEBUG_LOGGING]: false,
    [Feature.FOG_SHADES]: true,
    [Feature.FOG_SHADES_EVERYWHERE]: false,
    [Feature.FORCE_BRONZE_SWORD]: true,
    [Feature.GOD_MODE]: false,
    [Feature.HUD_BARS]: true,
    [Feature.LEVEL_UP_SCREEN]: false,
    [Feature.SHRINES]: false,
    [Feature.STAIRS_UP]: false,
    [Feature.TITLE_MUSIC]: true
  };
  export const isEnabled = (feature: Feature): boolean => {
    const queryParam = getQueryParam(feature);
    if (queryParam === 'true') {
      return true;
    }
    if (queryParam === 'false') {
      return false;
    }
    return ENABLED_FEATURES[feature];
  };
}

const getQueryParam = (param: string): string | null => {
  const { href } = document.location;
  const query = href?.split('?')?.[1];
  if (query) {
    const parts = query.split('&').map(part => part.split('='));
    for (const [key, value] of parts) {
      if (key.toUpperCase() === param.toUpperCase()) {
        return value;
      }
    }
  }
  return null;
};
