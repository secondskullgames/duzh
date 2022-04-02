import GameState from '../core/GameState';
import EquipmentClass from '../equipment/EquipmentClass';
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
  state.pushMessage(`Picked up a ${inventoryItem.name}.`);
  playSound(Sounds.PICK_UP_ITEM);
};

const useItem = async (unit: Unit, item: InventoryItem) => {
  await item.use(unit);
  unit.getInventory().remove(item);
};

const equipItem = async (item: InventoryItem, equipmentClass: EquipmentClass, unit: Unit) => {
  const equipment = await ItemFactory.createEquipment(equipmentClass);
  unit.getEquipment().add(equipment);
  equipment.attach(unit);
};

export {
  pickupItem,
  useItem,
  equipItem
};
