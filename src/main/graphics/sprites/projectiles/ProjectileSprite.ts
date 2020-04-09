import ImageSupplier from '../../ImageSupplier';
import Sprite from '../Sprite';
import Colors from '../../../types/Colors';
import Directions from '../../../types/Directions';
import { PaletteSwaps, Projectile } from '../../../types/types';

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
  private _projectile: Projectile;

  protected constructor(projectile: Projectile, spriteName: string, paletteSwaps: PaletteSwaps, spriteOffsets: { dx: number, dy: number }) {
    const imageMap = {
      [SpriteKey.N]: new ImageSupplier(`${spriteName}/${spriteName}_N_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.E]: new ImageSupplier(`${spriteName}/${spriteName}_E_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.S]: new ImageSupplier(`${spriteName}/${spriteName}_S_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.W]: new ImageSupplier(`${spriteName}/${spriteName}_W_1`, Colors.WHITE, paletteSwaps),
    };
    super(imageMap, SpriteKey.S, spriteOffsets);
    this._projectile = projectile;
  }

  update(): Promise<any> {
    this.key = this._getKey();
    return this.getImage();
  }

  private _getKey(): SpriteKey {
    const direction = this._projectile.direction || Directions.S;
    const key = `${Directions.toString(direction)}`;
    return <SpriteKey>key;
  }
}

export default ProjectileSprite;