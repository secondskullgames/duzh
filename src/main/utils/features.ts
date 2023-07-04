export enum Feature {
  PRODUCTION = 'PRODUCTION',
  DEBUG_BUTTONS = 'DEBUG_BUTTONS',
  DEBUG_LEVEL = 'DEBUG_LEVEL',
  LEVEL_UP_SCREEN = 'LEVEL_UP_SCREEN',
  DEDUPLICATE_EQUIPMENT = 'DEDUPLICATE_EQUIPMENT'
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
      case Feature.DEBUG_BUTTONS:
      case Feature.DEBUG_LEVEL:
        return !Feature.isEnabled(Feature.PRODUCTION);
      case Feature.LEVEL_UP_SCREEN:
        return false;
      case Feature.DEDUPLICATE_EQUIPMENT:
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