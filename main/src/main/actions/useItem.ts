import Unit from '../units/Unit';
import InventoryItem from '../items/InventoryItem';
import { ItemCategory } from '@duzh/models';
import { Game } from '@main/core/Game';

export const useItem = async (unit: Unit, item: InventoryItem, game: Game) => {
  await item.use(unit, game);
  unit.getInventory().remove(item);
  if (item.category === ItemCategory.SCROLL) {
    await game.engine.playTurn(game);
  }
};
