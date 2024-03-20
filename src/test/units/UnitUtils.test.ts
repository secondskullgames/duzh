import Unit from '@main/units/Unit';
import EquipmentMap from '@main/equipment/EquipmentMap';
import Equipment from '@main/equipment/Equipment';
import {
  calculateTotalIncomingDamage,
  getMeleeDamage,
  getRangedDamage
} from '@main/units/UnitUtils';
import { Direction } from '@lib/geometry/Direction';

describe('UnitUtils', () => {
  const sword = {
    slot: 'MELEE_WEAPON',
    damage: 5
  } as Equipment;
  const bow = {
    slot: 'RANGED_WEAPON',
    damage: 4
  } as Equipment;
  const mail = {
    slot: 'CHEST',
    damage: 3
  } as Equipment;
  const shield = {
    slot: 'SHIELD',
    blockAmount: 0.5
  } as Equipment;

  const unit = {
    getStrength: () => 2,
    getDexterity: () => 2,
    getEquipment: () =>
      ({
        getAll: () => [sword, bow, mail, shield]
      }) as EquipmentMap,
    getCoordinates: () => ({ x: 0, y: 0 }),
    getDirection: jest.fn()
  } as unknown as Unit;

  test('getMeleeDamage', () => {
    const meleeDamage = getMeleeDamage(unit);
    expect(meleeDamage).toBe(10); // 5 + 3 + 2
  });

  test('getRangedDamage', () => {
    const rangedDamage = getRangedDamage(unit);
    expect(rangedDamage).toBe(7); // 4 + 3 / 2 + 2
  });

  describe('calculateTotalIncomingDamage', () => {
    const attacker = {
      getCoordinates: () => ({ x: 1, y: 0 })
    } as Unit;

    test('frontal attack', () => {
      jest.mocked(unit.getDirection).mockReturnValue(Direction.E);
      const totalIncomingDamage = calculateTotalIncomingDamage(unit, 10, attacker);
      expect(totalIncomingDamage).toBe(5); // 10 * (1 - 0.5)
    });

    test('non-frontal attack', () => {
      jest.mocked(unit.getDirection).mockReturnValue(Direction.N);
      const totalIncomingDamage = calculateTotalIncomingDamage(unit, 10, attacker);
      expect(totalIncomingDamage).toBe(10); // 10 * (1 - 0)
    });
  });
});
