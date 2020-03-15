import MapSupplier from './MapSupplier';
import ItemFactory from '../items/ItemFactory';
import DungeonGenerator from './DungeonGenerator';
import UnitFactory from '../units/UnitFactory';

// outer dimensions

const MIN_ROOM_DIMENSION = 6;
const MAX_ROOM_DIMENSION = 9;
const MIN_ROOM_PADDING = 1;

function createRandomMap(level: number, width: number, height: number, numEnemies: number, numItems: number): MapSupplier {
  const dungeonGenerator = new DungeonGenerator(
    MIN_ROOM_DIMENSION,
    MAX_ROOM_DIMENSION,
    MIN_ROOM_PADDING
  );
  return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
}

export default { createRandomMap };
