export enum Feature {
  ALT_DASH = 'ALT_DASH',
  ALT_STRAFE = 'ALT_STRAFE',
  DEBUG_BUTTONS = 'DEBUG_BUTTONS',
  DEBUG_LEVEL = 'DEBUG_LEVEL',
  DEBUG_LOGGING = 'DEBUG_LOGGING',
  DEDUPLICATE_EQUIPMENT = 'DEDUPLICATE_EQUIPMENT',
  FAST_MOVE = 'FAST_MOVE',
  GOD_MODE = 'GOD_MODE',
  INVENTORY_V2 = 'INVENTORY_V2',
  LEVEL_UP_SCREEN = 'LEVEL_UP_SCREEN',
  PRODUCTION = 'PRODUCTION'
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
      case Feature.INVENTORY_V2:
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

const _isProduction = (): boolean => {
  return document.location.href === 'https://duzh.netlify.app';
};
