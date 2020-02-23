import Unit from '../classes/Unit';
import MapItem from '../classes/MapItem';
import InventoryItem from '../classes/InventoryItem';
import { playSound } from './AudioUtils';
import Sounds from '../Sounds';

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