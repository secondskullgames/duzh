import ImageSupplier from '../../ImageSupplier';
import Sprite, { Offsets } from '../Sprite';
import Colors from '../../../types/Colors';
import Directions from '../../../types/Directions';
import { Direction, PaletteSwaps, Projectile } from '../../../types/types';
import { fillTemplate } from '../../../utils/TemplateUtils';

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
  private static readonly TEMPLATE = '${sprite}/${sprite}_${direction}_{number}';
  private readonly _spriteName: string;
  private readonly _direction: Direction;
  private readonly _paletteSwaps: PaletteSwaps;

  protected constructor(direction: Direction, spriteName: string, paletteSwaps: PaletteSwaps, spriteOffsets: Offsets) {
    super(spriteOffsets);
    this._spriteName = spriteName;
    this._direction = direction;
    this._paletteSwaps = paletteSwaps;
  }

  getImage(): Promise<ImageBitmap> {
    const variables = {
      sprite: this._spriteName,
      direction: Directions.toString(this._direction),
      number: 1
    };
    const filename = fillTemplate(ProjectileSprite.TEMPLATE, variables);
    return new ImageSupplier(filename, Colors.WHITE, this._paletteSwaps).get();
  }
}

export default ProjectileSprite;