import EquipmentClass from '../items/equipment/EquipmentClass';
import ItemClass from '../items/ItemClass';
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
  const dungeonGenerator = _getDungeonGenerator(model.layout, await TileSet.forName(model.tileSet));
  const enemyUnitClasses: UnitClass[] = await Promise.all(model.enemies.map(UnitClass.load));
  const equipmentClasses: EquipmentClass[] = await Promise.all(model.equipment.map(EquipmentClass.load));
  const itemClasses: ItemClass[] = model.items.map(ItemClass.load);
  return dungeonGenerator.generateDungeon(model.levelNumber, model.width, model.height, model.numEnemies, model.numItems, enemyUnitClasses, equipmentClasses, itemClasses);
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
