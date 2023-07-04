import InventoryItem from '../items/InventoryItem';
import Equipment from '../equipment/Equipment';
import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { GlobalContext } from '../core/GlobalContext';

export const equipItem = async (
  item: InventoryItem,
  equipment: Equipment,
  unit: Unit,
  context: GlobalContext
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
  context.ticker.log(`Equipped ${equipment.getName()}.`, context);
  playSound(Sounds.BLOCKED);
};