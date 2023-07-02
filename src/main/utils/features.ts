export enum Feature {
  DEBUG_BUTTONS = 'DEBUG_BUTTONS',
  LEVEL_UP_SCREEN = 'LEVEL_UP_SCREEN',
}

export namespace Feature {
  export const isEnabled = (feature: Feature): boolean => {
    switch (feature) {
      case Feature.DEBUG_BUTTONS:
        return !_isProduction();
      case Feature.LEVEL_UP_SCREEN:
        return false;
    }
  };
}

const _isProduction = (): boolean => {
  return document.location.href === 'https://duzh.netlify.app';
};