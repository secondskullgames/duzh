import Equipment from '../equipment/Equipment';
import Unit from '../entities/units/Unit';
import { Feature } from '../utils/features';
import { abilityForName } from '../entities/units/abilities/abilityForName';
import { checkNotNull } from '../utils/preconditions';

export const unequipItem = (equipment: Equipment, unit: Unit) => {
  equipment.unattach();
  const inventoryItem = checkNotNull(equipment.inventoryItem);
  unit.getInventory().add(inventoryItem);
  unit.getEquipment().remove(equipment);

  if (Feature.isEnabled(Feature.ITEM_ABILITIES)) {
    const abilityName = equipment.getAbilityName();
    if (abilityName) {
      unit.forgetAbility(abilityForName(abilityName));
    }
  }
};
