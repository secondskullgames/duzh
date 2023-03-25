import TileType from './TileType';
import DoorDirection from './DoorDirection';

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
  objectColors: {
    [key: string]: string
  },
  defaultTile: TileType,
  tileset: string
};

export default PredefinedMapModel;
