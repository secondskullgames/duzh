import EquipmentModel from '../equipment/EquipmentModel';
import ItemModel from '../items/ItemModel';
import TileSet from '../tiles/TileSet';
import UnitClass from '../units/UnitClass';
import BlobMapGenerator from './generated/BlobMapGenerator';
import AbstractMapGenerator from './generated/AbstractMapGenerator';
import RoomCorridorMapGenerator from './generated/room_corridor/RoomCorridorMapGenerator';
import GeneratedMapBuilder from './generated/GeneratedMapBuilder';
import GeneratedMapModel from './generated/GeneratedMapModel';
import RoomCorridorMapGenerator2 from './generated/room_corridor_rewrite/RoomCorridorMapGenerator2';
import MapInstance from './MapInstance';
import MapLayout from './MapLayout';
import PredefinedMapBuilder from './predefined/PredefinedMapBuilder';
import PredefinedMapModel from './predefined/PredefinedMapModel';

const loadGeneratedMap = async (model: GeneratedMapModel): Promise<GeneratedMapBuilder> => {
  const dungeonGenerator = _getDungeonGenerator(model.layout, await TileSet.forName(model.tileSet));
  const enemyUnitClasses: UnitClass[] = await Promise.all(model.enemies.map(UnitClass.load));
  const equipmentClasses: EquipmentModel[] = await Promise.all(model.equipment.map(EquipmentModel.load));
  const itemClasses: ItemModel[] = model.items.map(ItemModel.load);
  return dungeonGenerator.generateMap(model.levelNumber, model.width, model.height, model.numEnemies, model.numItems, enemyUnitClasses, equipmentClasses, itemClasses);
};

const loadPredefinedMap = async (model: PredefinedMapModel): Promise<MapInstance> =>
  new PredefinedMapBuilder(model).build();

const _getDungeonGenerator = (mapLayout: MapLayout, tileSet: TileSet): AbstractMapGenerator => {
  switch (mapLayout) {
    case 'ROOMS_AND_CORRIDORS': {
      if (1 === 1) {
        return new RoomCorridorMapGenerator2(tileSet);
      }
      const minRoomDimension = 3;
      const maxRoomDimension = 7;
      return new RoomCorridorMapGenerator({
        tileSet,
        minRoomDimension,
        maxRoomDimension
      });
    }
    case 'BLOB':
      return new BlobMapGenerator(tileSet);
  }
};

export default {
  loadGeneratedMap,
  loadPredefinedMap
};
