import Color from './Color';

/**
 * declaration merging wizardry below
 */

type PaletteSwaps = {
  [src: string]: Color
};

namespace PaletteSwaps {
  export const create = (paletteSwaps: { [src: string]: Color }): PaletteSwaps => {
    const map: { [src: string]: Color } = {};
    Object.entries(paletteSwaps).forEach(([src, dest]) => {
      const srcHex : string = Color[src]!!;
      const destHex : string = Color[dest]!!;
      map[srcHex] = destHex;
    });
    return map;
  };
}

export default PaletteSwaps;
