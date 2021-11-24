import ItemFactory from '../items/ItemFactory';
import TileSet from '../types/TileSet';
import { MapLayout } from '../types/types';
import UnitClass from '../units/UnitClass';
import BlobDungeonGenerator from './generation/BlobDungeonGenerator';
import DungeonGenerator from './generation/DungeonGenerator';
import RoomCorridorDungeonGenerator2 from './generation/RoomCorridorDungeonGenerator2';
import MapBuilder from './MapBuilder';
import MapModel from './MapModel';

const loadMap = async (model: MapModel): Promise<MapBuilder> => {
  const { layout, tileSet, levelNumber, width, height, numEnemies, numItems, enemies } = model;
  const dungeonGenerator = _getDungeonGenerator(layout, await TileSet.forName(tileSet));
  const enemyUnitClasses: UnitClass[] = await Promise.all(enemies.map(UnitClass.load));
  return dungeonGenerator.generateDungeon(levelNumber, width, height, numEnemies, enemyUnitClasses, numItems, ItemFactory.createRandomItem);
};

const _getDungeonGenerator = (mapLayout: MapLayout, tileSet: TileSet): DungeonGenerator => {
  switch (mapLayout) {
    case 'ROOMS_AND_CORRIDORS': {
      const minRoomDimension = 3;
      const maxRoomDimension = 7;
      return new RoomCorridorDungeonGenerator2({
        tileSet,
        minRoomDimension,
        maxRoomDimension
      });
    }
    case 'BLOB':
      return new BlobDungeonGenerator(tileSet);
  }
};

export default { loadMap };
