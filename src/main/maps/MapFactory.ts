import MapSupplier from './MapSupplier';
import ItemFactory from '../items/ItemFactory';
import UnitFactory from '../units/UnitFactory';
import RoomCorridorDungeonGenerator from './generation/RoomCorridorDungeonGenerator';
import BlobDungeonGenerator from './generation/BlobDungeonGenerator';
import DungeonGenerator from './generation/DungeonGenerator';
import { MapLayout, TileSet } from '../types/types';
import { randInt } from '../utils/RandomUtils';

function createRandomMap(mapLayout: MapLayout, tileSet: TileSet, level: number, width: number, height: number, numEnemies: number, numItems: number): MapSupplier {
  const dungeonGenerator = _getDungeonGenerator(mapLayout, tileSet);
  return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
}

function _getDungeonGenerator(mapLayout: MapLayout, tileSet: TileSet): DungeonGenerator {
  switch (mapLayout) {
    case MapLayout.ROOMS_AND_CORRIDORS: {
      const minRoomDimension = randInt(6, 7);
      const maxRoomDimension = randInt(7, 9);
      const minRoomPadding = 2;
      return new RoomCorridorDungeonGenerator(
        tileSet,
        minRoomDimension,
        maxRoomDimension,
        minRoomPadding
      );
    }
    case MapLayout.BLOB:
      return new BlobDungeonGenerator(tileSet);
  }
}

export default { createRandomMap };
