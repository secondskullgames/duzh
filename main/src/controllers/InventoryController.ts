import { InventoryCategory, InventoryState } from '@main/core/state/InventoryState';
import { Game } from '@main/core/Game';
import { checkNotNull } from '@duzh/utils/preconditions';

export class InventoryController {
  prepareInventoryScreen = (game: Game): void => {
    const { state } = game;
    const playerUnit = state.getPlayerUnit();
    if (state.getInventoryState() === null) {
      state.setInventoryState(new InventoryState());
    }
    const inventoryState = checkNotNull(state.getInventoryState());
    switch (inventoryState.getSelectedCategory()) {
      case InventoryCategory.EQUIPMENT: {
        const equipment = inventoryState.getSelectedEquipment();
        if (equipment !== null && !playerUnit.getEquipment().includes(equipment)) {
          inventoryState.clearSelectedItem();
        }
        if (equipment === null) {
          inventoryState.nextItem(playerUnit);
        }
        break;
      }
      case InventoryCategory.ITEMS: {
        const selectedItem = inventoryState.getSelectedItem();
        if (selectedItem && !playerUnit.getInventory().includes(selectedItem)) {
          inventoryState.clearSelectedItem();
        }
        if (selectedItem === null) {
          inventoryState.nextItem(playerUnit);
        }
        break;
      }
    }
  };
}
