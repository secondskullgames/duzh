import Unit from '../units/Unit';
import Spawner, { SpawnerState } from '../objects/Spawner';
import Sounds from '../sounds/Sounds';
import GameObject, { ObjectType } from '../objects/GameObject';
import { Activity } from '../units/Activity';
import { sleep } from '@lib/utils/promises';
import { Globals } from '@main/core/globals';

export const attackObject = async (unit: Unit, target: GameObject) => {
  const { soundPlayer } = Globals;
  soundPlayer.playSound(Sounds.SPECIAL_ATTACK);
  unit.setActivity(Activity.ATTACKING, 1, unit.getDirection());
  await sleep(300);
  if (target.getObjectType() === ObjectType.SPAWNER) {
    const spawner = target as Spawner;
    spawner.setState(SpawnerState.DEAD);
  }
  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
};
