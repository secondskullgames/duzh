import { Color } from '@lib/graphics/Color';

export interface PaletteSwaps {
  entries: () => [Color, Color][];
  get: (color: Color) => Color | null;
  toString: () => string;
}

class Impl implements PaletteSwaps {
  private readonly _map: Record<string, Color>;
  private readonly _entries: [Color, Color][];

  constructor(map: Record<string, Color>) {
    this._map = map;
    this._entries = Object.entries(map).map(
      ([srcHex, dest]) => [Color.fromHex(srcHex), dest] as [Color, Color]
    );
  }

  entries = () => this._entries;
  get = (srcColor: Color): Color | null => this._map[srcColor.hex] ?? null;

  toString = () => {
    const map: Record<string, string> = {};
    for (const [src, dest] of this.entries()) {
      map[src.hex] = dest.hex;
    }
    return JSON.stringify(map);
  };
}

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
    return new Impl(map);
  };
}

export namespace PaletteSwaps {
  export const builder = () => new Builder();
  export const empty = (): PaletteSwaps => new Builder().build();
}
