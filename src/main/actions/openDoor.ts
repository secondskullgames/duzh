import Unit from '../entities/units/Unit';
import Door from '../entities/objects/Door';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';

export const openDoor = async (unit: Unit, door: Door) => {
  const keys = unit.getInventory().get('KEY');
  if (keys.length > 0) {
    unit.getInventory().remove(keys[0]);
    playSound(Sounds.OPEN_DOOR);
    await door.open();
  } else {
    playSound(Sounds.BLOCKED);
  }
};