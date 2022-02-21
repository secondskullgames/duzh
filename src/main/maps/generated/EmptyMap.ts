import TileType from '../../tiles/TileType';
import { Room } from '../../types/types';

type EmptyMap = {
  width:  number,
  height: number,
  rooms:  Room[],
  tiles:  TileType[][]
};

export default EmptyMap;
