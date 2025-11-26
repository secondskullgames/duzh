import Unit from '../units/Unit';
import Spawner, { SpawnerState } from '../objects/Spawner';
import GameObject, { ObjectType } from '../objects/GameObject';
import { Activity } from '../units/Activity';
import { sleep } from '@main/utils/promises';
import { Game } from '@main/core/Game';

export const attackObject = async (unit: Unit, target: GameObject, game: Game) => {
  const { soundController } = game;
  soundController.playSound('special_attack');
  unit.setActivity(Activity.ATTACKING, 1, unit.getDirection());
  await sleep(300);
  if (target.getObjectType() === ObjectType.SPAWNER) {
    const spawner = target as Spawner;
    spawner.setState(SpawnerState.DEAD);
  }
  unit.setActivity(Activity.STANDING, 1, unit.getDirection());
};
