import ImageSupplier from '../../ImageSupplier';
import Sprite from '../Sprite';
import Colors from '../../../types/Colors';
import Directions from '../../../types/Directions';
import { Direction, PaletteSwaps, Projectile } from '../../../types/types';

enum SpriteKey {
  N = 'N',
  E = 'E',
  S = 'S',
  W = 'W'
}

/**
 * Projectiles have a direction but no activity or frame numbers
 */
abstract class ProjectileSprite extends Sprite {
  private readonly _direction: Direction;

  protected constructor(direction: Direction, spriteName: string, paletteSwaps: PaletteSwaps, spriteOffsets: { dx: number, dy: number }) {
    const imageMap = {
      [SpriteKey.N]: new ImageSupplier(`${spriteName}/${spriteName}_N_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.E]: new ImageSupplier(`${spriteName}/${spriteName}_E_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.S]: new ImageSupplier(`${spriteName}/${spriteName}_S_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.W]: new ImageSupplier(`${spriteName}/${spriteName}_W_1`, Colors.WHITE, paletteSwaps),
    };
    super(imageMap, Directions.toString(direction), spriteOffsets);
    this._direction = direction;
  }

  update(): Promise<any> {
    return this.getImage();
  }
}

export default ProjectileSprite;