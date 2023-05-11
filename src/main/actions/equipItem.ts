import InventoryItem from '../items/InventoryItem';
import Equipment from '../equipment/Equipment';
import Unit from '../entities/units/Unit';
import GameState from '../core/GameState';
import { logMessage } from './logMessage';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';

type Props = Readonly<{
  state: GameState
}>;

export const equipItem = async (
  item: InventoryItem,
  equipment: Equipment,
  unit: Unit,
  { state }: Props
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
  logMessage(`Equipped ${equipment.getName()}.`, { state });
  playSound(Sounds.BLOCKED);
};