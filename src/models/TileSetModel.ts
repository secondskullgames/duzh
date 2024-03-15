export type TileSetModel = Readonly<{
  path: string;
  tiles: {
    [key: string]: (string | null)[];
  };
  paletteSwaps?: {
    [key: string]: string;
  };
}>;
