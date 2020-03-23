import Unit from '../../units/Unit';
import { Activity } from '../../types/types';
import { chainPromises, wait } from '../../utils/PromiseUtils';

type AnimationFrame = {
  unit: Unit,
  activity: Activity
};

type Animation = {
  frames: AnimationFrame[][],
  delay: number
};

function playAttackingAnimation(source: Unit, target: Unit): Promise<any> {
  return _playAnimation({
    frames: [
      [
        { unit: source, activity: Activity.ATTACKING },
        { unit: target, activity: Activity.DAMAGED }
      ],
      [
        { unit: source, activity: Activity.STANDING },
        { unit: target, activity: Activity.STANDING }
      ]
    ],
    delay: 150
  });
}

function _playAnimation(animation: Animation): Promise<any> {
  const { delay, frames } = animation;

  const promises: (() => Promise<any>)[] = [];
  for (let i = 0; i < frames.length; i++) {
    const updatePromise = () => {
      const updatePromises: Promise<any>[] = [];
      for (let j = 0; j < frames[i].length; j++) {
        const { unit, activity } = frames[i][j];
        unit.activity = activity;
        console.log(unit.name + " " + activity + " => update");

        updatePromises.push(unit.sprite.update());
      }
      return Promise.all(updatePromises);
    };
    promises.push(updatePromise);
    promises.push(() => {
      console.log("render");
      return jwb.renderer.render();
    });
    if (i < (frames.length - 1)) {
      promises.push(() => {
        console.log("wait");
        return wait(delay);
      });
    }
  }

  return chainPromises(promises);
}

export {
  playAttackingAnimation
};