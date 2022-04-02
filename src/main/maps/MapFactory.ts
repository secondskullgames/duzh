import EquipmentClass from '../equipment/EquipmentClass';
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
import MapSpec from './MapSpec';
import PredefinedMapBuilder from './predefined/PredefinedMapBuilder';
import PredefinedMapModel from './predefined/PredefinedMapModel';

const loadMap = (map: MapSpec): Promise<MapInstance> => {
  switch (map.type) {
    case 'generated': {
      return (async () => {
        const mapModel = await GeneratedMapModel.load(map.id);
        const mapBuilder = await loadGeneratedMap(mapModel);
        return mapBuilder.build();
      })();
    }
    case 'predefined': {
      return (async () => {
        const mapModel = await PredefinedMapModel.load(map.id);
        return loadPredefinedMap(mapModel);
      })();
    }
  }
};

const loadGeneratedMap = async (model: GeneratedMapModel): Promise<GeneratedMapBuilder> => {
  const dungeonGenerator = _getDungeonGenerator(model.layout, await TileSet.forName(model.tileSet));
  const enemyUnitClasses: Map<UnitClass, number> = await _loadMapWithCounts(model.enemies, UnitClass.load);
  const equipmentClasses: Map<EquipmentClass, number> = await _loadMapWithCounts(model.equipment, EquipmentClass.load);
  const itemClasses: Map<ItemModel, number> = await _loadMapWithCounts(model.items, itemId => Promise.resolve(ItemModel.load(itemId)));
  return dungeonGenerator.generateMap({ model, enemyUnitClasses, equipmentClasses, itemClasses });
};

const _loadMapWithCounts = async <T> (
  nameToCount: Record<string, number>,
  mapper: (name: string) => Promise<T>
): Promise<Map<T, number>> => {
  const promises: Promise<[T, number]>[] = [];
  for (const [name, count] of Object.entries(nameToCount)) {
    promises.push(mapper(name).then(item => [item, count]));
  }
  const itemsAndCounts: [T, number][] = await Promise.all(promises);
  const map = new Map<T, number>();
  for (const [item, count] of itemsAndCounts) {
    map.set(item, count);
  }
  return map;
};

const loadPredefinedMap = async (model: PredefinedMapModel): Promise<MapInstance> =>
  new PredefinedMapBuilder(model).build();

const _getDungeonGenerator = (mapLayout: MapLayout, tileSet: TileSet): AbstractMapGenerator => {
  switch (mapLayout) {
    case 'ROOMS_AND_CORRIDORS': {
      const useNewMapGenerator = true;
      if (useNewMapGenerator) {
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
  loadMap
};
