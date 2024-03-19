import { isBlocked } from '@main/maps/MapUtils';
import MapInstance from '@main/maps/MapInstance';
import Tile from '@main/tiles/Tile';
import Unit from '@main/units/Unit';
import GameObject from '@main/objects/GameObject';

const _emptyMap = (): MapInstance => {
  return new MapInstance({
    id: 'test',
    width: 10,
    height: 10,
    levelNumber: 1,
    startingCoordinates: { x: 0, y: 0 },
    music: null,
    fogParams: {
      enabled: false
    }
  });
};

describe('MapUtils', () => {
  describe('isBlocked', () => {
    test('unblocked', () => {
      const map = _emptyMap();
      const tile = {
        getCoordinates: () => ({ x: 0, y: 0 }),
        isBlocking: () => false
      } as unknown as Tile;
      map.addTile(tile);
      expect(isBlocked(map, { x: 0, y: 0 })).toBe(false);
    });

    test('invalid', () => {
      const map = _emptyMap();
      expect(isBlocked(map, { x: 20, y: 20 })).toBe(true);
    });

    test('blocked by wall', () => {
      const map = _emptyMap();
      const tile = {
        getCoordinates: () => ({ x: 0, y: 0 }),
        isBlocking: () => true
      } as unknown as Tile;
      map.addTile(tile);
      expect(isBlocked(map, { x: 0, y: 0 })).toBe(true);
    });

    test('blocked by unit', () => {
      const map = _emptyMap();
      const tile = {
        getCoordinates: () => ({ x: 0, y: 0 }),
        isBlocking: () => false
      } as unknown as Tile;
      map.addTile(tile);
      const unit = {
        getCoordinates: () => ({ x: 0, y: 0 })
      } as unknown as Unit;
      map.addUnit(unit);
      expect(isBlocked(map, { x: 0, y: 0 })).toBe(true);
    });

    test('blocked by object', () => {
      const map = _emptyMap();
      const tile = {
        getCoordinates: () => ({ x: 0, y: 0 }),
        isBlocking: () => false
      } as unknown as Tile;
      map.addTile(tile);
      const object = {
        getCoordinates: () => ({ x: 0, y: 0 }),
        isBlocking: () => true
      } as unknown as GameObject;
      map.addObject(object);
      expect(isBlocked(map, { x: 0, y: 0 })).toBe(true);
    });
  });
});
