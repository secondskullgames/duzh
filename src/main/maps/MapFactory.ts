import ImageLoader from '../graphics/images/ImageLoader';
import EquipmentClass from '../items/equipment/EquipmentClass';
import ItemClass from '../items/ItemClass';
import TileSet from '../types/TileSet';
import { MapLayout } from '../types/types';
import UnitClass from '../units/UnitClass';
import BlobDungeonGenerator from './generated/BlobDungeonGenerator';
import DungeonGenerator from './generated/DungeonGenerator';
import RoomCorridorDungeonGenerator2 from './generated/RoomCorridorDungeonGenerator2';
import GeneratedMapBuilder from './generated/GeneratedMapBuilder';
import GeneratedMapModel from './generated/GeneratedMapModel';
import MapInstance from './MapInstance';
import PredefinedMapBuilder from './predefined/PredefinedMapBuilder';
import PredefinedMapModel from './predefined/PredefinedMapModel';

const loadGeneratedMap = async (model: GeneratedMapModel): Promise<GeneratedMapBuilder> => {
  const dungeonGenerator = _getDungeonGenerator(model.layout, await TileSet.forName(model.tileSet));
  const enemyUnitClasses: UnitClass[] = await Promise.all(model.enemies.map(UnitClass.load));
  const equipmentClasses: EquipmentClass[] = await Promise.all(model.equipment.map(EquipmentClass.load));
  const itemClasses: ItemClass[] = model.items.map(ItemClass.load);
  return dungeonGenerator.generateDungeon(model.levelNumber, model.width, model.height, model.numEnemies, model.numItems, enemyUnitClasses, equipmentClasses, itemClasses);
};

const loadPredefinedMap = async (model: PredefinedMapModel): Promise<MapInstance> =>
  new PredefinedMapBuilder(model).build();

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

export default {
  loadGeneratedMap,
  loadPredefinedMap
};
