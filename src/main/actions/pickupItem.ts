import Unit from '../units/Unit';
import MapItem from '../objects/MapItem';
import Sounds from '../sounds/Sounds';
import { Globals } from '@main/core/globals';

export const pickupItem = (unit: Unit, mapItem: MapItem) => {
  const { session, soundPlayer } = Globals;
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  session
    .getTicker()
    .log(`Picked up a ${inventoryItem.name}.`, { turn: session.getTurn() });
  soundPlayer.playSound(Sounds.PICK_UP_ITEM);
};
