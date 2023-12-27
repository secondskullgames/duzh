export enum Feature {
  ALT_DASH = 'ALT_DASH',
  ALT_FREE_MOVE = 'ALT_FREE_MOVE',
  ALT_STRAFE = 'ALT_STRAFE',
  BLINK_THROUGH_WALLS = 'BLINK_THROUGH_WALLS',
  BUSY_INDICATOR = 'BUSY_INDICATOR',
  DARK_DUNGEON = 'DARK_DUNGEON',
  DEBUG_BUTTONS = 'DEBUG_BUTTONS',
  DEBUG_LEVEL = 'DEBUG_LEVEL',
  DEBUG_LOGGING = 'DEBUG_LOGGING',
  DEDUPLICATE_EQUIPMENT = 'DEDUPLICATE_EQUIPMENT',
  FAST_MOVE = 'FAST_MOVE',
  GOD_MODE = 'GOD_MODE',
  INVENTORY_V2 = 'INVENTORY_V2',
  ITEM_ABILITIES = 'ITEM_ABILITIES',
  LEVEL_UP_SCREEN = 'LEVEL_UP_SCREEN',
  PRODUCTION = 'PRODUCTION'
}

const _isProduction = (): boolean => {
  return document.location.href === 'https://duzh.netlify.app';
};

const ENABLED_FEATURES: Record<Feature, boolean> = {
  [Feature.PRODUCTION]: _isProduction(),
  [Feature.ALT_DASH]: false,
  [Feature.ALT_FREE_MOVE]: false,
  [Feature.ALT_STRAFE]: false,
  [Feature.BLINK_THROUGH_WALLS]: false,
  [Feature.BUSY_INDICATOR]: true,
  [Feature.DARK_DUNGEON]: false,
  [Feature.DEBUG_BUTTONS]: false,
  [Feature.DEBUG_LEVEL]: false,
  [Feature.DEDUPLICATE_EQUIPMENT]: true,
  [Feature.DEBUG_LOGGING]: false,
  [Feature.FAST_MOVE]: false,
  [Feature.GOD_MODE]: false,
  [Feature.INVENTORY_V2]: true,
  [Feature.ITEM_ABILITIES]: true,
  [Feature.LEVEL_UP_SCREEN]: false
};

export namespace Feature {
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
