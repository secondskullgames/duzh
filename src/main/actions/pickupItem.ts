import Unit from '../units/Unit';
import MapItem from '../objects/MapItem';
import Sounds from '../sounds/Sounds';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';

export const pickupItem = (
  unit: Unit,
  mapItem: MapItem,
  session: Session,
  state: GameState
) => {
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  session
    .getTicker()
    .log(`Picked up a ${inventoryItem.name}.`, { turn: session.getTurn() });
  state.getSoundPlayer().playSound(Sounds.PICK_UP_ITEM);
};
