import Color from './Color';

/**
 * declaration merging wizardry below
 */

type PaletteSwaps = Record<string, Color>;

namespace PaletteSwaps {
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
