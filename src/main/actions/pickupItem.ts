import Unit from '../entities/units/Unit';
import MapItem from '../entities/objects/MapItem';
import Sounds from '../sounds/Sounds';
import { Session, GameState } from '@main/core';

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
