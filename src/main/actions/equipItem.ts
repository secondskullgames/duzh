import Equipment from '../equipment/Equipment';
import Unit from '../entities/units/Unit';
import Sounds from '../sounds/Sounds';
import { Session, GameState } from '@main/core';

export const equipItem = async (
  equipment: Equipment,
  unit: Unit,
  session: Session,
  state: GameState
) => {
  const currentEquipment = unit.getEquipment().getBySlot(equipment.slot);
  if (currentEquipment) {
    const inventoryItem = currentEquipment.inventoryItem;
    if (inventoryItem) {
      unit.getInventory().add(inventoryItem);
    }
  }
  unit.getEquipment().add(equipment);
  equipment.attach(unit);
  session
    .getTicker()
    .log(`Equipped ${equipment.getName()}.`, { turn: session.getTurn() });
  state.getSoundPlayer().playSound(Sounds.BLOCKED);
};
