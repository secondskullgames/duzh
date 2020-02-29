import ImageSupplier from '../ImageSupplier';
import Sprite from './Sprite';
import { SpriteSupplier } from '../../types/types';
import PlayerSprite from './PlayerSprite';
import Colors from '../../types/Colors';

const DEFAULT_SPRITE_KEY = 'default';

function _staticSprite(imageLoader: ImageSupplier, { dx, dy }: { dx: number, dy: number }): Sprite {
  return new Sprite({ [DEFAULT_SPRITE_KEY]: imageLoader }, DEFAULT_SPRITE_KEY, { dx, dy });
}

const SpriteFactory: { [name: string]: SpriteSupplier } = {
  PLAYER: paletteSwaps => new PlayerSprite(paletteSwaps),
  WALL_TOP: paletteSwaps => _staticSprite(new ImageSupplier('tile_wall', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  WALL_HALL: paletteSwaps => _staticSprite(new ImageSupplier('tile_wall_hall', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  FLOOR: paletteSwaps => _staticSprite(new ImageSupplier('tile_floor', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  FLOOR_HALL: paletteSwaps => _staticSprite(new ImageSupplier('tile_floor_hall', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  MAP_SWORD: paletteSwaps => _staticSprite(new ImageSupplier('sword_icon_small', Colors.WHITE, paletteSwaps), { dx: 0, dy: -8 }),
  MAP_POTION: paletteSwaps => _staticSprite(new ImageSupplier('potion_small', Colors.WHITE, paletteSwaps), { dx: 0, dy: -8 }),
  MAP_SCROLL: paletteSwaps => _staticSprite(new ImageSupplier('scroll_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  STAIRS_DOWN: paletteSwaps => _staticSprite(new ImageSupplier('stairs_down2', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 })
};

export default SpriteFactory;