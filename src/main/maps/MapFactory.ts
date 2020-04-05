import MapSupplier from './MapSupplier';
import ItemFactory from '../items/ItemFactory';
import UnitFactory from '../units/UnitFactory';
import { TileSet } from '../types/types';
import { randInt } from '../utils/RandomUtils';
import RoomCorridorDungeonGenerator from './generation/RoomCorridorDungeonGenerator';
import BlobDungeonGenerator from './generation/BlobDungeonGenerator';

// outer dimensions

function createRandomMap(tileSet: TileSet, level: number, width: number, height: number, numEnemies: number, numItems: number): MapSupplier {
  const minRoomDimension = randInt(5, 7);
  const maxRoomDimension = randInt(7, 10);
  const minRoomPadding = randInt(0, 2);
  /*const dungeonGenerator = new RoomCorridorDungeonGenerator(
    tileSet,
    minRoomDimension,
    maxRoomDimension,
    minRoomPadding
  );*/
  const dungeonGenerator = new BlobDungeonGenerator(tileSet);
  return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
}

export default { createRandomMap };
