import TileType from '../../tiles/TileType';
import { Room } from '../../types/types';

type MapSection = {
  width:  number,
  height: number,
  rooms:  Room[],
  tiles:  TileType[][]
};

export default MapSection;
