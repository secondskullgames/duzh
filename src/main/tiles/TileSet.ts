import TileType from '../schemas/TileType';
import { Sprite } from '@main/graphics/sprites';

type TileSet = Readonly<{
  [key in TileType]?: (Sprite | null)[];
}>;

export default TileSet;
