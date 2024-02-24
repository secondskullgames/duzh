import Unit from '../../../main/entities/units/Unit';
import EquipmentMap from '../../../main/equipment/EquipmentMap';
import Equipment from '../../../main/equipment/Equipment';
import { getMeleeDamage } from '../../../main/entities/units/UnitUtils';

describe('UnitUtils', () => {
  test('getMeleeDamage', () => {
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

    const unit = {
      getStrength: () => 2,
      getEquipment: () =>
        ({
          getAll: () => [sword, bow, mail]
        }) as EquipmentMap
    } as Unit;

    const meleeDamage = getMeleeDamage(unit);
    expect(meleeDamage).toBe(10);
  });
});
