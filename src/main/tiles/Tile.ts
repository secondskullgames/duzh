import Sprite from '../graphics/sprites/Sprite';
import { randChoice } from '../utils/random';
import TileSet from './TileSet';
import TileType from './TileType';

interface Tile {
  type: TileType,
  sprite: Sprite | null,
  isBlocking: boolean
}

namespace Tile {
  export const create = (type: TileType, tileSet: TileSet): Tile => ({
    type,
    sprite: randChoice(tileSet[type]!!),
    isBlocking: TileType.isBlocking(type)
  });
}

export default Tile;
