import Unit from '../units/Unit';
import MapItem from '../objects/MapItem';
import { Game } from '@main/core/Game';

export const pickupItem = (unit: Unit, mapItem: MapItem, game: Game) => {
  const { state, soundController, ticker } = game;
  const { inventoryItem } = mapItem;
  unit.getInventory().add(inventoryItem);
  ticker.log(`Picked up a ${inventoryItem.name}.`, { turn: state.getTurn() });
  soundController.playSound('pick_up_item');
};
