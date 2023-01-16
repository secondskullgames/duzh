import { TileType } from '../../../gen-schema/tile-type.schema';

type EmptyMap = Readonly<{
  width:  number,
  height: number,
  tiles:  TileType[][]
}>;

export default EmptyMap;
