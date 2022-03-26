import { checkNotNull } from '../utils/preconditions';
import Color, { Colors } from './Color';

type PaletteSwaps = Record<Color, Color>;

namespace PaletteSwaps {
  /**
   * @param paletteSwaps Contains a map of color names, to be converted to hex format
   */
  export const create = (paletteSwaps: Record<string, string>): PaletteSwaps => {
    const map: PaletteSwaps = {};
    for (const [src, dest] of Object.entries(paletteSwaps)) {
      const srcHex: string = checkNotNull(Colors[src], `Color '${src}' not found`);
      const destHex: string = checkNotNull(Colors[dest], `Color '${dest}' not found`);
      map[srcHex] = destHex;
    }
    return map;
  };
}

export default PaletteSwaps;
