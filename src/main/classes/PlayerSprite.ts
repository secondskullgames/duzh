import ImageLoader from './ImageLoader';
import { replaceAll } from '../utils/ImageUtils';
import Sprite from './Sprite';

enum SpriteKeys {
  STANDING = 'STANDING',
  STANDING_DAMAGED = 'STANDING_DAMAGED'
}

class PlayerSprite extends Sprite {
  static SpriteKeys = SpriteKeys;

  constructor(paletteSwaps) {
    super({
      [SpriteKeys.STANDING]: new ImageLoader('player_standing_SE_1', '#ffffff', paletteSwaps),
      [SpriteKeys.STANDING_DAMAGED]: new ImageLoader('player_standing_SE_1', '#ffffff', paletteSwaps, [img => replaceAll(img, '#ffffff')])
    }, SpriteKeys.STANDING, { dx: -4, dy: -20 })
  }
}

export default PlayerSprite;