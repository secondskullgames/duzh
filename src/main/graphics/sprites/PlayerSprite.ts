import { PaletteSwaps } from '../../types/types';
import Unit from '../../units/Unit';
import UnitSprite from './UnitSprite';

class PlayerSprite extends UnitSprite {
  constructor(unit: Unit, paletteSwaps: PaletteSwaps) {
    super(unit, 'player', paletteSwaps, { dx: -4, dy: -20 });
  }
}

export default PlayerSprite;