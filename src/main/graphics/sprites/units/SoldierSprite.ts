import { PaletteSwaps } from '../../../types/types';
import Unit from '../../../units/Unit';
import UnitSprite from './UnitSprite';

class SoldierSprite extends UnitSprite {
  constructor(unit: Unit, paletteSwaps: PaletteSwaps) {
    super(unit, 'soldier', paletteSwaps, { dx: -4, dy: -20 });
  }
}

export default SoldierSprite;