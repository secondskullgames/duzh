import Unit from '../classes/Unit';
import MapItem from '../classes/MapItem';
import InventoryItem from '../classes/InventoryItem';
import { playSound } from './AudioUtils';
import Sounds from '../Sounds';
import { resolvedPromise } from './PromiseUtils';

function pickupItem(unit: Unit, mapItem: MapItem) {
  const { state } = jwb;
  const inventoryItem = mapItem.inventoryItem();
  const { category } = inventoryItem;
  const { inventory } = unit;
  inventory[category] = inventory[category] || [];
  inventory[category].push(inventoryItem);
  state.inventoryIndex = state.inventoryIndex || 0;
  state.messages.push(`Picked up a ${inventoryItem.name}.`);
  playSound(Sounds.PICK_UP_ITEM);
}

function useItem(unit: Unit, item: (InventoryItem | null)): Promise<any> {
  const { state } = jwb;
  if (!!item) {
    return item.use(unit)
      .then(() => {
        const items = unit.inventory[item.category];
        items.splice(state.inventoryIndex, 1);
        if (state.inventoryIndex >= items.length) {
          state.inventoryIndex--;
        }
      });
  }
  return resolvedPromise();
}

export {
  pickupItem,
  useItem
};