import Unit from '../units/Unit';
import MapItem from '../objects/MapItem';
import Sounds from '../sounds/Sounds';
import { Globals } from '@main/core/globals';

export const pickupItem = (unit: Unit, mapItem: MapItem) => {
  const { soundPlayer, ticker } = Globals;
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  ticker.log(`Picked up a ${inventoryItem.name}.`);
  soundPlayer.playSound(Sounds.PICK_UP_ITEM);
};
