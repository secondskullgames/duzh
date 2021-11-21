import TileSet from '../types/TileSet';
import ItemFactory from '../items/ItemFactory';
import UnitFactory from '../units/UnitFactory';
import BlobDungeonGenerator from './generation/BlobDungeonGenerator';
import DungeonGenerator from './generation/DungeonGenerator';
import RoomCorridorDungeonGenerator2 from './generation/RoomCorridorDungeonGenerator2';
import { MapLayout } from '../types/types';
import MapBuilder from './MapBuilder';
import MapModel from './MapModel';

const loadMap = async (model: MapModel): Promise<MapBuilder> => {
  const { layout, tileSet, levelNumber, width, height, numEnemies, numItems } = model;
  const dungeonGenerator = _getDungeonGenerator(layout, await TileSet.forName(tileSet));
  return dungeonGenerator.generateDungeon(levelNumber, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
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
