import Equipment from '../equipment/Equipment';
import Unit from '../entities/units/Unit';
import Sounds from '../sounds/Sounds';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { EventType } from '@main/core/EventLog';

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
  state.getEventLog().log({
    type: EventType.EQUIPMENT_EQUIPPED,
    message: `Equipped ${equipment.getName()}.`,
    sessionId: session.id,
    turn: session.getTurn(),
    timestamp: new Date()
  });
  state.getSoundPlayer().playSound(Sounds.BLOCKED);
};
