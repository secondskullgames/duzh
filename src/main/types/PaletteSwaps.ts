import Color, { Colors } from './Color';

type PaletteSwaps = Record<Color, Color>;

namespace PaletteSwaps {
  /**
   * @param paletteSwaps Contains a map of color names, to be converted to hex format
   */
  export const create = (paletteSwaps: Record<string, string>): PaletteSwaps => {
    const map: PaletteSwaps = {};
    for (const [src, dest] of Object.entries(paletteSwaps)) {
      const srcHex : string = Colors[src]!!;
      const destHex : string = Colors[dest]!!;
      map[srcHex] = destHex;
    }
    return map;
  };
}

export default PaletteSwaps;
