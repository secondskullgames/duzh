import { TileSet } from '../types/TileFactory';
import MapBuilder from './MapBuilder';
import ItemFactory from '../items/ItemFactory';
import UnitFactory from '../units/UnitFactory';
import BlobDungeonGenerator from './generation/BlobDungeonGenerator';
import DungeonGenerator from './generation/DungeonGenerator';
import { MapLayout } from '../types/types';
import RoomCorridorDungeonGenerator2 from './generation/RoomCorridorDungeonGenerator2';

const createRandomMap = (
  mapLayout: MapLayout,
  tileSet: TileSet,
  level: number,
  width: number,
  height: number,
  numEnemies: number,
  numItems: number
): MapBuilder => {
  const dungeonGenerator = _getDungeonGenerator(mapLayout, tileSet);
  return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
};

const _getDungeonGenerator = (mapLayout: MapLayout, tileSet: TileSet): DungeonGenerator => {
  switch (mapLayout) {
    case MapLayout.ROOMS_AND_CORRIDORS: {
      const minRoomDimension = 3;
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
};

export default { createRandomMap };
