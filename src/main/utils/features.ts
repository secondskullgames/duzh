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
  STAIRS_UP = 'STAIRS_UP',
  TITLE_MUSIC = 'TITLE_MUSIC'
}

export namespace Feature {
  export const isEnabled = (feature: Feature): boolean => {
    const queryParam = getQueryParam(feature);
    if (queryParam === 'true') {
      return true;
    }
    if (queryParam === 'false') {
      return false;
    }
    switch (feature) {
      case Feature.ALT_DASH:
        return true;
      case Feature.ALT_STRAFE:
        return false;
      case Feature.ALT_TURN:
        return false;
      case Feature.BLINK_THROUGH_WALLS:
        return false;
      case Feature.BUSY_INDICATOR:
        return true;
      case Feature.DARK_DUNGEON:
        return false;
      case Feature.DEBUG_BUTTONS:
        return false;
      case Feature.DEBUG_LEVEL:
        return false;
      case Feature.DEDUPLICATE_EQUIPMENT:
        return true;
      case Feature.DEBUG_LOGGING:
        return false;
      case Feature.FOG_SHADES:
        return true;
      case Feature.FOG_SHADES_EVERYWHERE:
        return false;
      case Feature.FORCE_BRONZE_SWORD:
        return true;
      case Feature.GOD_MODE:
        return false;
      case Feature.HUD_BARS:
        return true;
      case Feature.LEVEL_UP_SCREEN:
        return false;
      case Feature.STAIRS_UP:
        return false;
      case Feature.TITLE_MUSIC:
        return true;
    }
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
