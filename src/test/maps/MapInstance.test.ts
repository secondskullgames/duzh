import MapInstance from '../../main/maps/MapInstance';
import Unit from '../../main/entities/units/Unit';
jest.mock('../../main/entities/units/Unit');
import mocked = jest.mocked;
const Unit_mock = mocked(Unit, { shallow: true });

test('adds and removes a unit', () => {
  const map = _emptyMap();
  const coordinates = { x: 3, y: 3 };
  expect(map.getAllUnits()).toStrictEqual([]);
  const unit = {
    getCoordinates: () => coordinates,
    getType: () => 'unit'
  } as Unit;
  map.addUnit(unit);
  expect(map.getAllUnits()).toStrictEqual([unit]);
  expect(map.getUnit(coordinates)).toBe(unit);
  map.removeUnit(unit);
  expect(map.getAllUnits()).toStrictEqual([]);
  expect(map.getUnit(coordinates)).toBe(null);
});

const _emptyMap = (): MapInstance => new MapInstance({
  width: 10,
  height: 10,
  tiles: [],
  doors: [],
  spawners: [],
  units: [],
  items: [],
  music: null
})
