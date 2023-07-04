import Unit from '../entities/units/Unit';
import MapItem from '../entities/objects/MapItem';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { GlobalContext } from '../core/GlobalContext';

export const pickupItem = (unit: Unit, mapItem: MapItem, context: GlobalContext) => {
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  context.ticker.log(`Picked up a ${inventoryItem.name}.`, context);
  playSound(Sounds.PICK_UP_ITEM);
};