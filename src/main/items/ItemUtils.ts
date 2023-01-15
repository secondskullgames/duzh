import GameState from '../core/GameState';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Unit from '../units/Unit';
import InventoryItem from './InventoryItem';
import ItemFactory from './ItemFactory';
import MapItem from '../objects/MapItem';

const pickupItem = (unit: Unit, mapItem: MapItem) => {
  const state = GameState.getInstance();
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  state.logMessage(`Picked up a ${inventoryItem.name}.`);
  playSound(Sounds.PICK_UP_ITEM);
};

const useItem = async (unit: Unit, item: InventoryItem) => {
  await item.use(unit);
  unit.getInventory().remove(item);
};

const equipItem = async (item: InventoryItem, equipmentClass: string, unit: Unit) => {
  const equipment = await ItemFactory.createEquipment(equipmentClass);
  const currentEquipment = unit.getEquipment().getBySlot(equipment.slot);
  if (currentEquipment) {
    const inventoryItem = currentEquipment.inventoryItem;
    if (inventoryItem) {
      unit.getInventory().add(inventoryItem);
    }
  }
  unit.getEquipment().add(equipment);
  equipment.attach(unit);
  GameState.getInstance().logMessage(`Equipped ${equipment.getName()}.`);
  playSound(Sounds.BLOCKED);
};

export {
  pickupItem,
  useItem,
  equipItem
};
