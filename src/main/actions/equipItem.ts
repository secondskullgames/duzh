import Equipment from '../equipment/Equipment';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';

export const equipItem = async (
  equipment: Equipment,
  unit: Unit,
  session: Session,
  state: GameState
) => {
  const currentEquipment = unit.getEquipment().getBySlot(equipment.slot);
  if (currentEquipment) {
    _unequipItem(currentEquipment, unit);
  }
  unit.getEquipment().add(equipment);
  if (equipment.ability) {
    unit.learnAbility(equipment.ability);
  }
  equipment.attach(unit);
  session
    .getTicker()
    .log(`Equipped ${equipment.getName()}.`, { turn: session.getTurn() });
  state.getSoundPlayer().playSound(Sounds.BLOCKED);
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
