import Unit from '../units/Unit';
import MapItem from '../objects/MapItem';
import Sounds from '../sounds/Sounds';
import { Game } from '@main/core/Game';

export const pickupItem = (unit: Unit, mapItem: MapItem, game: Game) => {
  const { session, soundPlayer, ticker } = game;
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  ticker.log(`Picked up a ${inventoryItem.name}.`, { turn: session.getTurn() });
  soundPlayer.playSound(Sounds.PICK_UP_ITEM);
};
