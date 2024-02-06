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
  FAST_MOVE = 'FAST_MOVE',
  GOD_MODE = 'GOD_MODE',
  LEVEL_UP_SCREEN = 'LEVEL_UP_SCREEN',
  PRODUCTION = 'PRODUCTION',
  STAIRS_UP = 'STAIRS_UP'
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
      case Feature.PRODUCTION:
        return _isProduction();
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
      case Feature.DEBUG_LEVEL:
        return !Feature.isEnabled(Feature.PRODUCTION);
      case Feature.LEVEL_UP_SCREEN:
        return false;
      case Feature.DEDUPLICATE_EQUIPMENT:
        return true;
      case Feature.DEBUG_LOGGING:
        return false;
      case Feature.GOD_MODE:
        return false;
      case Feature.FAST_MOVE:
        return false;
      case Feature.STAIRS_UP:
        return false;
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

const _isProduction = (): boolean => {
  return document.location.href === 'https://duzh.netlify.app';
};
