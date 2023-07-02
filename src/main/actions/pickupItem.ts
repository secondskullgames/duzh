import Unit from '../entities/units/Unit';
import MapItem from '../entities/objects/MapItem';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';
import Ticker from '../core/Ticker';

type Context = Readonly<{
  state: GameState,
  ticker: Ticker
}>;

export const pickupItem = (unit: Unit, mapItem: MapItem, { state, ticker }: Context) => {
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  ticker.log(`Picked up a ${inventoryItem.name}.`, { turn: state.getTurn() });
  playSound(Sounds.PICK_UP_ITEM);
};