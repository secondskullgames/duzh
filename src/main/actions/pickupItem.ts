import Unit from '../entities/units/Unit';
import MapItem from '../entities/objects/MapItem';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

export const pickupItem = (unit: Unit, mapItem: MapItem, { state, session }: Context) => {
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  session
    .getTicker()
    .log(`Picked up a ${inventoryItem.name}.`, { turn: state.getTurn() });
  playSound(Sounds.PICK_UP_ITEM);
};
