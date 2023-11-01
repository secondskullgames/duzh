import TileType from '../../schemas/TileType';

type EmptyMap = Readonly<{
  width: number;
  height: number;
  tiles: TileType[][];
}>;

export default EmptyMap;
