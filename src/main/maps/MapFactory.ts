import MapSupplier from './MapSupplier';
import ItemFactory from '../items/ItemFactory';
import DungeonGenerator from './DungeonGenerator';
import UnitFactory from '../units/UnitFactory';
import { TileSet } from '../types/types';
import { randInt } from '../utils/RandomUtils';

// outer dimensions

const MIN_ROOM_DIMENSION = 5;
const MAX_ROOM_DIMENSION = 9;
const MIN_ROOM_PADDING = 1;

function createRandomMap(tileSet: TileSet, level: number, width: number, height: number, numEnemies: number, numItems: number): MapSupplier {
  const minRoomDimension = randInt(5, 7);
  const maxRoomDimension = randInt(7, 10);
  const minRoomPadding = randInt(0, 2);
  const dungeonGenerator = new DungeonGenerator(
    tileSet,
    minRoomDimension,
    maxRoomDimension,
    minRoomPadding
  );
  return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
}

export default { createRandomMap };
