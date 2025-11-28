export type Feature =
  | 'alert_on_error'
  // Note: Only one ALT_ feature should be enabled at any one time.
  // They don't work together and the precedence is undefined.
  | 'alt_dash'
  | 'alt_strafe'
  | 'alt_turn'
  | 'blink_through_walls'
  | 'busy_indicator'
  | 'dark_dungeon'
  | 'debug_buttons'
  | 'debug_level'
  | 'debug_logging'
  | 'deduplicate_equipment'
  | 'double_buffering'
  | 'enemy_life_indicators'
  | 'fog_shades'
  | 'fog_shades_everywhere'
  | 'force_bronze_sword'
  | 'force_short_bow'
  | 'god_mode'
  | 'mobile_web'
  | 'hud_bars'
  | 'rooms_and_corridors_2'
  | 'shrines'
  | 'stairs_up'
  | 'title_music';

export namespace Feature {
  const ENABLED_FEATURES: Record<Feature, boolean> = {
    alert_on_error: true,
    alt_dash: true,
    alt_strafe: false,
    alt_turn: false,
    blink_through_walls: false,
    busy_indicator: true,
    dark_dungeon: false,
    debug_buttons: false,
    debug_level: false,
    deduplicate_equipment: true,
    debug_logging: false,
    double_buffering: true,
    enemy_life_indicators: false,
    fog_shades: true,
    fog_shades_everywhere: false,
    force_bronze_sword: true,
    force_short_bow: true,
    god_mode: false,
    hud_bars: true,
    mobile_web: true,
    rooms_and_corridors_2: true,
    shrines: true,
    stairs_up: false,
    title_music: true
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
