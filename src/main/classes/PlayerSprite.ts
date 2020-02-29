import ImageSupplier from './ImageSupplier';
import { replaceAll } from '../utils/ImageUtils';
import Sprite from './Sprite';
import { PaletteSwaps } from '../types';
import Colors from '../types/Colors';

enum SpriteKeys {
  STANDING = 'STANDING',
  STANDING_DAMAGED = 'STANDING_DAMAGED'
}

class PlayerSprite extends Sprite {
  static SpriteKeys = SpriteKeys;

  constructor(paletteSwaps?: PaletteSwaps) {
    super({
      [SpriteKeys.STANDING]: new ImageSupplier('player_standing_SE_1', Colors.WHITE, paletteSwaps),
      [SpriteKeys.STANDING_DAMAGED]: new ImageSupplier('player_standing_SE_1', Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)])
    }, SpriteKeys.STANDING, { dx: -4, dy: -20 })
  }
}

export default PlayerSprite;