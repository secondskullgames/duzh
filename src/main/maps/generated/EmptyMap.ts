import TileType from '../../tiles/TileType';

type EmptyMap = Readonly<{
  width:  number,
  height: number,
  tiles:  TileType[][]
}>;

export default EmptyMap;
