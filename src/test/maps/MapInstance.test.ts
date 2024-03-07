import MapInstance from '@main/maps/MapInstance';
import Unit from '@main/entities/units/Unit';

test('adds and removes a unit', () => {
  const map = _emptyMap();
  const coordinates = { x: 3, y: 3 };
  expect(map.getAllUnits()).toStrictEqual([]);
  const unit = {
    getCoordinates: () => coordinates,
    getType: () => 'unit'
  } as unknown as Unit;
  map.addUnit(unit);
  expect(map.getAllUnits()).toStrictEqual([unit]);
  expect(map.getUnit(coordinates)).toBe(unit);
  expect(map.unitExists(unit)).toBe(true);
  map.removeUnit(unit);
  expect(map.getAllUnits()).toStrictEqual([]);
  expect(map.getUnit(coordinates)).toBe(null);
  expect(map.unitExists(unit)).toBe(false);
});

const _emptyMap = (): MapInstance =>
  new MapInstance({
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
