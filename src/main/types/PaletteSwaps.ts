import Color from './Color';

type PaletteSwaps = Record<string, Color>;

namespace PaletteSwaps {
  /**
   * @param paletteSwaps Contains a map of color names, to be converted to hex format
   */
  export const create = (paletteSwaps: { [src: string]: Color }): PaletteSwaps => {
    const map: { [src: string]: Color } = {};
    for (const [src, dest] of Object.entries(paletteSwaps)) {
      const srcHex : string = Color[src]!!;
      const destHex : string = Color[dest]!!;
      map[srcHex] = destHex;
    }
    return map;
  };
}

export default PaletteSwaps;
