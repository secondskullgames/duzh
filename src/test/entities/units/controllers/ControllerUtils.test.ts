import Unit from '@main/entities/units/Unit';
import { Faction } from '@main/entities/units/Faction';
import MapInstance from '@main/maps/MapInstance';
import fn = jest.fn;

describe('ControllerUtils', () => {
  describe('getNearestEnemyUnit', () => {
    const _getUnits = fn();
    const map = {
      getAllUnits: _getUnits
    } as unknown as MapInstance;
    const first = {
      getFaction: () => Faction.PLAYER,
      getCoordinates: () => ({ x: 0, y: 0 }),
      getMap: () => map
    } as Unit;
    const second = {
      getFaction: () => Faction.ENEMY,
      getCoordinates: () => ({ x: 2, y: 0 })
    } as Unit;
    const third = {
      getFaction: () => Faction.ENEMY,
      getCoordinates: () => ({ x: 0, y: 3 })
    } as Unit;

    test('should return the nearest enemy unit', async () => {
      _getUnits.mockReturnValue([first, second, third]);

      const { getNearestEnemyUnit } = await import(
        '@main/entities/units/controllers/ControllerUtils'
      );
      const result = getNearestEnemyUnit(first);
      expect(result).toBe(second);
    });

    test('should return null if there are no enemy units', async () => {
      _getUnits.mockReturnValue([first]);

      const { getNearestEnemyUnit } = await import(
        '@main/entities/units/controllers/ControllerUtils'
      );
      const result = getNearestEnemyUnit(first);
      expect(result).toBeNull();
    });
  });
});
