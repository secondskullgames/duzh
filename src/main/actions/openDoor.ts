import Unit from '../entities/units/Unit';
import Door from '../entities/objects/Door';
import Sounds from '../sounds/Sounds';
import { GameState } from '@main/core/GameState';

export const openDoor = async (unit: Unit, door: Door, state: GameState) => {
  const keys = unit.getInventory().get('KEY');
  if (keys.length > 0) {
    unit.getInventory().remove(keys[0]);
    state.getSoundPlayer().playSound(Sounds.OPEN_DOOR);
    await door.open();
  } else {
    state.getSoundPlayer().playSound(Sounds.BLOCKED);
  }
};
