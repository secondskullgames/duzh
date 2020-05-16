import Unit from '../units/Unit';
import MapItem from './MapItem';
import InventoryItem from './InventoryItem';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';

function pickupItem(unit: Unit, mapItem: MapItem) {
  const { state } = jwb;
  const { inventoryItem } = mapItem;
  unit.inventory.add(inventoryItem);
  state.messages.push(`Picked up a ${inventoryItem.name}.`);
  playSound(Sounds.PICK_UP_ITEM);
}

function useItem(unit: Unit, item: InventoryItem): Promise<any> {
  return item.use(unit)
    .then(() => unit.inventory.remove(item));
}

export {
  pickupItem,
  useItem
};