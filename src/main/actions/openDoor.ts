import Unit from '../units/Unit';
import Door from '../objects/Door';
import Sounds from '../sounds/Sounds';
import { GameState } from '@main/core/GameState';
import { ItemCategory } from '@models/ItemCategory';

export const openDoor = async (unit: Unit, door: Door, state: GameState) => {
  if (door.isLocked()) {
    const keys = unit.getInventory().get(ItemCategory.KEY);
    if (keys.length > 0) {
      unit.getInventory().remove(keys[0]);
      state.getSoundPlayer().playSound(Sounds.OPEN_DOOR);
      door.open();
    } else {
      state.getSoundPlayer().playSound(Sounds.BLOCKED);
    }
  } else if (door.isClosed()) {
    state.getSoundPlayer().playSound(Sounds.OPEN_DOOR);
    door.open();
  }
};
