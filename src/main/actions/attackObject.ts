import Unit from '../units/Unit';
import Spawner, { SpawnerState } from '../objects/Spawner';
import Sounds from '../sounds/Sounds';
import GameObject, { ObjectType } from '../objects/GameObject';
import { Activity } from '../units/Activity';
import { sleep } from '@lib/utils/promises';
import { GameState } from '@main/core/GameState';

export const attackObject = async (unit: Unit, target: GameObject, state: GameState) => {
  state.getSoundPlayer().playSound(Sounds.SPECIAL_ATTACK);
  unit.setActivity(Activity.ATTACKING, 1, unit.getDirection());
  await sleep(300);
  if (target.getObjectType() === ObjectType.SPAWNER) {
    const spawner = target as Spawner;
    spawner.setState(SpawnerState.DEAD);
  }
  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
};
