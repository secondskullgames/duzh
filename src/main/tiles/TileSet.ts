import Sprite from '../graphics/sprites/Sprite';
import TileType from '../schemas/TileType';

type TileSet = Readonly<{
  [key in TileType]?: (Sprite | null)[];
}>;

export default TileSet;
