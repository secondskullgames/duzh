import InventoryItem from '../items/InventoryItem';
import Equipment from '../equipment/Equipment';
import Unit from '../entities/units/Unit';
import GameState from '../core/GameState';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Ticker from '../core/Ticker';

type Context = Readonly<{
  state: GameState;
  ticker: Ticker;
}>;

export const equipItem = async (
  item: InventoryItem,
  equipment: Equipment,
  unit: Unit,
  { state, ticker }: Context
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
  ticker.log(`Equipped ${equipment.getName()}.`, { turn: state.getTurn() });
  playSound(Sounds.BLOCKED);
};
