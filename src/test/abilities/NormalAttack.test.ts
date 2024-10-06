import Unit from '@main/units/Unit';
import MapInstance from '@main/maps/MapInstance';
import { Direction } from '@lib/geometry/Direction';

describe('NormalAttack', () => {
  test('successful attack', async () => {
    const _attackUnit = jest.fn();
    jest.mock('@main/actions/attackUnit', () => ({
      attackUnit: _attackUnit
    }));
    jest.mock('@main/units/UnitUtils', () => ({
      getMeleeDamage: jest.fn().mockReturnValue(13)
    }));

    const { NormalAttack } = await import('@main/abilities/NormalAttack');
    const map = {
      getUnit: jest.fn()
    } as unknown as MapInstance;
    const unit = {
      gainMana: jest.fn(),
      getCoordinates: () => ({ x: 1, y: 1 }),
      getDirection: () => Direction.E,
      getEquipment: () => ({
        getAll: () => []
      }),
      getMana: () => 10,
      getMap: () => map,
      setActivity: jest.fn(),
      setDirection: jest.fn()
    } as unknown as Unit;
    const targetUnit = {
      getDirection: () => Direction.W,
      setActivity: jest.fn()
    } as unknown as Unit;
    jest.mocked(map.getUnit).mockReturnValue(targetUnit);
    const coordinates = { x: 2, y: 1 };
    await new NormalAttack().use(unit, coordinates);
    expect(_attackUnit).toHaveBeenCalled();
  });

  test('no target unit', async () => {
    const _attackUnit = jest.fn();
    jest.mock('@main/actions/attackUnit', () => ({
      attackUnit: _attackUnit
    }));
    jest.mock('@main/units/UnitUtils', () => ({
      getMeleeDamage: jest.fn().mockReturnValue(13)
    }));

    const { NormalAttack } = await import('@main/abilities/NormalAttack');
    const map = {
      getUnit: jest.fn()
    } as unknown as MapInstance;
    const unit = {
      gainMana: jest.fn(),
      getCoordinates: () => ({ x: 1, y: 1 }),
      getDirection: () => Direction.E,
      getEquipment: () => ({
        getAll: () => []
      }),
      getMana: () => 10,
      getMap: () => map,
      setActivity: jest.fn(),
      setDirection: jest.fn()
    } as unknown as Unit;
    jest.mocked(map.getUnit).mockReturnValue(null);
    const coordinates = { x: 2, y: 1 };
    await new NormalAttack().use(unit, coordinates);
    expect(_attackUnit).not.toHaveBeenCalled();
  });
});
