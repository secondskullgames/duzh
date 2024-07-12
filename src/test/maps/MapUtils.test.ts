import { isBlocked } from '@main/maps/MapUtils';
import MapInstance from '@main/maps/MapInstance';
import Tile from '@main/tiles/Tile';
import Unit from '@main/units/Unit';
import GameObject from '@main/objects/GameObject';

const origin = { x: 0, y: 0 };
const _emptyMap = (): MapInstance => {
  return new MapInstance({
    id: 'test',
    width: 10,
    height: 10,
    levelNumber: 1,
    startingCoordinates: origin,
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
        getCoordinates: () => origin,
        isBlocking: () => false
      } as unknown as Tile;
      map.addTile(tile);
      expect(isBlocked(origin, map)).toBe(false);
    });

    test('invalid', () => {
      const map = _emptyMap();
      expect(isBlocked({ x: 20, y: 20 }, map)).toBe(true);
    });

    test('blocked by wall', () => {
      const map = _emptyMap();
      const tile = {
        getCoordinates: () => origin,
        isBlocking: () => true
      } as unknown as Tile;
      map.addTile(tile);
      expect(isBlocked(origin, map)).toBe(true);
    });

    test('blocked by unit', () => {
      const map = _emptyMap();
      const tile = {
        getCoordinates: () => origin,
        isBlocking: () => false
      } as unknown as Tile;
      map.addTile(tile);
      const unit = {
        getCoordinates: () => origin
      } as unknown as Unit;
      map.addUnit(unit);
      expect(isBlocked(origin, map)).toBe(true);
    });

    test('blocked by object', () => {
      const map = _emptyMap();
      const tile = {
        getCoordinates: () => origin,
        isBlocking: () => false
      } as unknown as Tile;
      map.addTile(tile);
      const object = {
        getCoordinates: () => origin,
        isBlocking: () => true
      } as unknown as GameObject;
      map.addObject(object);
      expect(isBlocked(origin, map)).toBe(true);
    });
  });
});
