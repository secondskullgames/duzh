import ProjectileSprite from './ProjectileSprite';
import { PaletteSwaps, Projectile } from '../../../types/types';

class ArrowSprite extends ProjectileSprite {
  constructor(projectile: Projectile, paletteSwaps: PaletteSwaps) {
    super(projectile, 'arrow', paletteSwaps, { dx: 0, dy: 0 });
  }
}

export default ArrowSprite;