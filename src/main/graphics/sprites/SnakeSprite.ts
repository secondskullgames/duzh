import { PaletteSwaps } from '../../types/types';
import Unit from '../../units/Unit';
import UnitSprite from './UnitSprite';

class SnakeSprite extends UnitSprite {
  constructor(unit: Unit, paletteSwaps: PaletteSwaps) {
    super(unit, 'snake', paletteSwaps, { dx: 0, dy: 0 });
  }
}

export default SnakeSprite;