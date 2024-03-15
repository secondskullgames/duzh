import Sprite from '../graphics/sprites/Sprite';
import { TileType } from '@models/TileType';

export type TileSet = Readonly<{
  [key in TileType]?: (Sprite | null)[];
}>;
