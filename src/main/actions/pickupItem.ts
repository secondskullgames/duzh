import Unit from '../entities/units/Unit';
import MapItem from '../entities/objects/MapItem';
import { logMessage } from './logMessage';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';

type Context = Readonly<{
  state: GameState
}>;

export const pickupItem = (unit: Unit, mapItem: MapItem, { state }: Context) => {
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  logMessage(`Picked up a ${inventoryItem.name}.`, { state });
  playSound(Sounds.PICK_UP_ITEM);
};