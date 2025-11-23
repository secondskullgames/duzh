import Sprite from '../graphics/sprites/Sprite';
import { TileType } from '@duzh/models';

export type TileSet = Readonly<{
  [key in TileType]?: (Sprite | null)[];
}>;
