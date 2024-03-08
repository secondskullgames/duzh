import Sprite from '../graphics/sprites/Sprite';
import TileType from '../../models/TileType';

type TileSet = Readonly<{
  [key in TileType]?: (Sprite | null)[];
}>;

export default TileSet;
