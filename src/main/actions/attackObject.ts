import Unit from '../entities/units/Unit';
import Spawner, { SpawnerState } from '../entities/objects/Spawner';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameObject, { ObjectType } from '../entities/objects/GameObject';
import Activity from '../entities/units/Activity';
import { sleep } from '../utils/promises';

export const attackObject = async (unit: Unit, target: GameObject) => {
  playSound(Sounds.SPECIAL_ATTACK);
  unit.setActivity(Activity.ATTACKING, 1, unit.getDirection());
  await sleep(300);
  if (target.getObjectType() === ObjectType.SPAWNER) {
    const spawner = target as Spawner;
    spawner.setState(SpawnerState.DEAD);
  }
  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
};
