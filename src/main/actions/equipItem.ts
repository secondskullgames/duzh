import Equipment from '../equipment/Equipment';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Globals } from '@main/core/globals';

export const equipItem = async (equipment: Equipment, unit: Unit) => {
  const { ticker, soundPlayer } = Globals;
  const currentEquipment = unit.getEquipment().getBySlot(equipment.slot);
  if (currentEquipment) {
    _unequipItem(currentEquipment, unit);
  }
  unit.getEquipment().add(equipment);
  if (equipment.ability) {
    unit.learnAbility(equipment.ability);
  }
  equipment.attach(unit);
  ticker.log(`Equipped ${equipment.getName()}.`);
  soundPlayer.playSound(Sounds.BLOCKED);
};

const _unequipItem = (equipment: Equipment, unit: Unit) => {
  const inventoryItem = equipment.inventoryItem;
  if (inventoryItem) {
    unit.getInventory().add(inventoryItem);
  }
  if (equipment.ability) {
    unit.unlearnAbility(equipment.ability);
  }
  equipment.unattach(unit);
};
