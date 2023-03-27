import TileType from './TileType';

type PredefinedMapModel = {
  imageFilename: string,
  levelNumber: number,
  music?: string,
  startingPointColor: string,
  tileColors: {
    [key: string]: TileType
  },
  enemyColors: {
    [key: string]: string
  },
  equipmentColors?: {
    [key: string]: string
  },
  itemColors?: {
    [key: string]: string
  },
  objectColors?: {
    [key: string]: string
  },
  defaultTile: TileType,
  tileset: string
};

export default PredefinedMapModel;
