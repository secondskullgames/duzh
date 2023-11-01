type TileSetModel = {
  path: string;
  tiles: {
    [key: string]: (string | null)[];
  };
  paletteSwaps?: {
    [key: string]: string;
  };
};

export default TileSetModel;
