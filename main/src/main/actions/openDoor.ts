import Unit from '../units/Unit';
import Door from '../objects/Door';
import { ItemCategory } from '@duzh/models';
import { Game } from '@main/core/Game';

export const openDoor = async (unit: Unit, door: Door, game: Game) => {
  const { soundController } = game;
  if (door.isLocked()) {
    const keys = unit.getInventory().get(ItemCategory.KEY);
    if (keys.length > 0) {
      unit.getInventory().remove(keys[0]);
      soundController.playSound('open_door');
      door.open();
    } else {
      soundController.playSound('blocked');
    }
  } else if (door.isClosed()) {
    soundController.playSound('open_door');
    door.open();
  }
};
