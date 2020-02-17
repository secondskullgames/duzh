import Sprite from './classes/Sprite';

export default {
  PLAYER: paletteSwaps => new Sprite('player_standing_SE_1', { dx: -4, dy: -20 }, '#ffffff', paletteSwaps),
  WALL_TOP: () => new Sprite('tile_wall', { dx: 0, dy: 0 }, '#ffffff'),
  WALL_HALL: () => new Sprite('tile_wall_hall', { dx: 0, dy: 0 }, '#ffffff'),
  FLOOR: () => new Sprite('tile_floor', { dx: 0, dy: 0 }, '#ffffff'),
  FLOOR_HALL: () => new Sprite('tile_floor_hall', { dx: 0, dy: 0 }, '#ffffff'),
  MAP_SWORD: () => new Sprite('sword_icon_small', { dx: 0, dy: -8 }, '#ffffff'),
  MAP_POTION: () => new Sprite('potion_small', { dx: 0, dy: -8 }, '#ffffff'),
  MAP_SCROLL: () => new Sprite('scroll_icon', { dx: 0, dy: 0 }, '#ffffff'),
  STAIRS_DOWN: () => new Sprite('stairs_down2', { dx: 0, dy: 0 }, '#ffffff')
};
