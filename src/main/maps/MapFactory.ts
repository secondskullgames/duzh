import MapBuilder from './MapBuilder';
import ItemFactory from '../items/ItemFactory';
import UnitFactory from '../units/UnitFactory';
import RoomCorridorDungeonGenerator from './generation/RoomCorridorDungeonGenerator';
import BlobDungeonGenerator from './generation/BlobDungeonGenerator';
import DungeonGenerator from './generation/DungeonGenerator';
import { MapLayout, TileSet } from '../types/types';
import { randInt } from '../utils/RandomUtils';
import RoomCorridorDungeonGenerator2 from './generation/RoomCorridorDungeonGenerator2';

function createRandomMap(
  mapLayout: MapLayout,
  tileSet: TileSet,
  level: number,
  width: number,
  height: number,
  numEnemies: number,
  numItems: number
): MapBuilder {
  const dungeonGenerator = _getDungeonGenerator(mapLayout, tileSet);
  return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
}

function _getDungeonGenerator(mapLayout: MapLayout, tileSet: TileSet): DungeonGenerator {
  switch (mapLayout) {
    case MapLayout.ROOMS_AND_CORRIDORS: {
      const minRoomDimension = 4;
      const maxRoomDimension = 7;
      // return new RoomCorridorDungeonGenerator(
      return new RoomCorridorDungeonGenerator2(
        tileSet,
        minRoomDimension,
        maxRoomDimension
      );
    }
    case MapLayout.BLOB:
      return new BlobDungeonGenerator(tileSet);
  }
}

export default { createRandomMap };
