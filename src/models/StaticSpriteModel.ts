export type StaticSpriteModel = Readonly<{
  name: string;
  filename: string;
  offsets: {
    dx: number;
    dy: number;
  };
  transparentColor: string;
  paletteSwaps?: Record<string, string>;
}>;
