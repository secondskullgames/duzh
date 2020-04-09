import ProjectileSprite from './ProjectileSprite';
import { Direction, PaletteSwaps, Projectile } from '../../../types/types';

class ArrowSprite extends ProjectileSprite {
  constructor(direction: Direction, paletteSwaps: PaletteSwaps) {
    super(direction, 'arrow', paletteSwaps, { dx: 0, dy: 0 });
  }
}

export default ArrowSprite;