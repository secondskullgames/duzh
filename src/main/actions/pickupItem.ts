import Unit from '../entities/units/Unit';
import MapItem from '../entities/objects/MapItem';
import Sounds from '../sounds/Sounds';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { EventType } from '@main/core/EventLog';

export const pickupItem = (
  unit: Unit,
  mapItem: MapItem,
  session: Session,
  state: GameState
) => {
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  state.getEventLog().log({
    type: EventType.ITEM_PICKED_UP,
    message: `Picked up a ${inventoryItem.name}.`,
    sessionId: session.id,
    turn: session.getTurn(),
    timestamp: new Date()
  });
  state.getSoundPlayer().playSound(Sounds.PICK_UP_ITEM);
};
