import Unit from '../units/Unit';
import MapItem from '../objects/MapItem';
import Sounds from '../sounds/Sounds';
import { GameState } from '@main/core/GameState';

export const pickupItem = (unit: Unit, mapItem: MapItem, state: GameState) => {
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  state.ticker.log(`Picked up a ${inventoryItem.name}.`, state);
  state.getSoundPlayer().playSound(Sounds.PICK_UP_ITEM);
};
