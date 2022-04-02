import EquipmentClass from '../equipment/EquipmentClass';
import ItemClass from '../items/ItemClass';
import TileSet from '../tiles/TileSet';
import UnitClass from '../units/UnitClass';
import BlobMapGenerator from './generated/BlobMapGenerator';
import AbstractMapGenerator from './generated/AbstractMapGenerator';
import RoomCorridorMapGenerator from './generated/room_corridor/RoomCorridorMapGenerator';
import GeneratedMapBuilder from './generated/GeneratedMapBuilder';
import GeneratedMapClass from './generated/GeneratedMapClass';
import RoomCorridorMapGenerator2 from './generated/room_corridor_rewrite/RoomCorridorMapGenerator2';
import MapInstance from './MapInstance';
import MapLayout from './MapLayout';
import MapSpec from './MapSpec';
import PredefinedMapBuilder from './predefined/PredefinedMapBuilder';
import PredefinedMapClass from './predefined/PredefinedMapClass';

const loadMap = (map: MapSpec): Promise<MapInstance> => {
  switch (map.type) {
    case 'generated': {
      return (async () => {
        const mapClass = await GeneratedMapClass.load(map.id);
        const mapBuilder = await loadGeneratedMap(mapClass);
        return mapBuilder.build();
      })();
    }
    case 'predefined': {
      return (async () => {
        const mapClass = await PredefinedMapClass.load(map.id);
        return loadPredefinedMap(mapClass);
      })();
    }
  }
};

const loadGeneratedMap = async (mapClass: GeneratedMapClass): Promise<GeneratedMapBuilder> => {
  const dungeonGenerator = _getDungeonGenerator(mapClass.layout, await TileSet.load(mapClass.tileSet));
  const enemyUnitClasses: Map<UnitClass, number> = await _loadMapWithCounts(mapClass.enemies, UnitClass.load);
  const equipmentClasses: Map<EquipmentClass, number> = await _loadMapWithCounts(mapClass.equipment, EquipmentClass.load);
  const itemClasses: Map<ItemClass, number> = await _loadMapWithCounts(mapClass.items, itemId => Promise.resolve(ItemClass.load(itemId)));
  return dungeonGenerator.generateMap({ mapClass, enemyUnitClasses, equipmentClasses, itemClasses });
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

const loadPredefinedMap = async (mapClass: PredefinedMapClass): Promise<MapInstance> =>
  new PredefinedMapBuilder(mapClass).build();

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
