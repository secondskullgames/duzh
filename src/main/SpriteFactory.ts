import ImageLoader from './classes/ImageLoader';
import Sprite from './classes/Sprite';
import { SpriteSupplier } from './types';
import PlayerSprite from './classes/PlayerSprite';
import Colors from './types/Colors';

const DEFAULT_SPRITE_KEY = 'default';

function _staticSprite(imageLoader: ImageLoader, { dx, dy }): Sprite {
  return new Sprite({ [DEFAULT_SPRITE_KEY]: imageLoader }, DEFAULT_SPRITE_KEY, { dx, dy });
}

const SpriteFactory: { [name: string]: SpriteSupplier } = {
  PLAYER: paletteSwaps => new PlayerSprite(paletteSwaps),
  WALL_TOP: paletteSwaps => _staticSprite(new ImageLoader('tile_wall', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  WALL_HALL: paletteSwaps => _staticSprite(new ImageLoader('tile_wall_hall', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  FLOOR: paletteSwaps => _staticSprite(new ImageLoader('tile_floor', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  FLOOR_HALL: paletteSwaps => _staticSprite(new ImageLoader('tile_floor_hall', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  MAP_SWORD: paletteSwaps => _staticSprite(new ImageLoader('sword_icon_small', Colors.WHITE, paletteSwaps), { dx: 0, dy: -8 }),
  MAP_POTION: paletteSwaps => _staticSprite(new ImageLoader('potion_small', Colors.WHITE, paletteSwaps), { dx: 0, dy: -8 }),
  MAP_SCROLL: paletteSwaps => _staticSprite(new ImageLoader('scroll_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  STAIRS_DOWN: paletteSwaps => _staticSprite(new ImageLoader('stairs_down2', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 })
};

export default SpriteFactory;