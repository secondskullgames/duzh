import TileType from '../../tiles/TileType';
import { Room } from '../../types/types';

type EmptyMap = {
  width:  number,
  height: number,
  tiles:  TileType[][]
};

export default EmptyMap;
