import { checkNotNull } from '../utils/preconditions';
import Color from './Color';
import Colors from './Colors';

type PaletteSwaps = {
  entries: () => [Color, Color][],
  get: (color: Color) => Color | null;
};

class Builder {
  private readonly entries: [Color, Color][];

  constructor() {
    this.entries = [];
  }

  addMapping = (src: Color, dest: Color) => {
    this.entries.push([src, dest]);
    return this;
  };

  build = (): PaletteSwaps => {
    // source hex -> dest color
    const map: Record<string, Color> = {};
    for (const [src, dest] of this.entries) {
      map[src.hex] = dest;
    }
    return {
      entries: () => this.entries,
      get: (srcColor: Color): (Color | null) => map[srcColor.hex] || null
    };
  };
}

const _empty: PaletteSwaps = new Builder().build();

namespace PaletteSwaps {
  /**
   * @param paletteSwaps Contains a map of color names, to be converted to hex format
   */
  export const create = (paletteSwaps: Record<string, string>): PaletteSwaps => {
    const builder = new Builder();
    for (const [srcName, destName] of Object.entries(paletteSwaps)) {
      const srcColor: Color = checkNotNull(Colors[srcName], `Color '${srcName}' not found`);
      const destColor: Color = checkNotNull(Colors[destName], `Color '${destName}' not found`);
      builder.addMapping(srcColor, destColor);
    }
    return builder.build();
  };

  export const builder = () => new Builder();
  export const empty = (): PaletteSwaps => _empty;
}

export default PaletteSwaps;
