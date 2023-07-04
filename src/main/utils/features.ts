export enum Feature {
  DEBUG_BUTTONS = 'DEBUG_BUTTONS',
  LEVEL_UP_SCREEN = 'LEVEL_UP_SCREEN',
  DEDUPLICATE_EQUIPMENT = 'DEDUPLICATE_EQUIPMENT'
}

export namespace Feature {
  export const isEnabled = (feature: Feature): boolean => {
    switch (feature) {
      case Feature.DEBUG_BUTTONS:
        return !_isProduction();
      case Feature.LEVEL_UP_SCREEN:
        return false;
      case Feature.DEDUPLICATE_EQUIPMENT:
        return true;
    }
  };
}

const _isProduction = (): boolean => {
  return document.location.href === 'https://duzh.netlify.app';
};