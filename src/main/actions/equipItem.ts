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
