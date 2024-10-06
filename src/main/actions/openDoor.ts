import Unit from '../units/Unit';
import Door from '../objects/Door';
import Sounds from '../sounds/Sounds';
import { ItemCategory } from '@models/ItemCategory';
import { Globals } from '@main/core/globals';

export const openDoor = async (unit: Unit, door: Door) => {
  const { soundPlayer } = Globals;
  if (door.isLocked()) {
    const keys = unit.getInventory().get(ItemCategory.KEY);
    if (keys.length > 0) {
      unit.getInventory().remove(keys[0]);
      soundPlayer.playSound(Sounds.OPEN_DOOR);
      door.open();
    } else {
      soundPlayer.playSound(Sounds.BLOCKED);
    }
  } else if (door.isClosed()) {
    soundPlayer.playSound(Sounds.OPEN_DOOR);
    door.open();
  }
};
