import GameState from '../core/GameState';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Unit from '../units/Unit';
import EquipmentClass from './equipment/EquipmentClass';
import InventoryItem from './InventoryItem';
import ItemFactory from './ItemFactory';
import MapItem from './MapItem';

const pickupItem = (unit: Unit, mapItem: MapItem) => {
  const state = GameState.getInstance();
  const { inventoryItem } = mapItem;
  unit.inventory.add(inventoryItem);
  state.messages.push(`Picked up a ${inventoryItem.name}.`);
  playSound(Sounds.PICK_UP_ITEM);
};

const useItem = async (unit: Unit, item: InventoryItem) => {
  await item.use(unit);
  unit.inventory.remove(item);
};

const equipItem = async (item: InventoryItem, equipmentClass: EquipmentClass, unit: Unit) => {
  const equipment = await ItemFactory.createEquipment(equipmentClass);
  unit.equipment.add(equipment);
  equipment.attach(unit);
};

export {
  pickupItem,
  useItem,
  equipItem
};
