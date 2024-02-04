import Equipment from '../equipment/Equipment';
import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { Session } from '../core/Session';

export const equipItem = async (equipment: Equipment, unit: Unit, session: Session) => {
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
  playSound(Sounds.BLOCKED);
};
