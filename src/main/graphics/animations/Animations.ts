import Unit from '../../units/Unit';
import { Activity } from '../../types/types';
import { chainPromises, wait } from '../../utils/PromiseUtils';

const FRAME_LENGTH = 150; // milliseconds

type UnitAnimationFrame = {
  unit: Unit,
  activity: Activity
};

type AnimationFrame = UnitAnimationFrame[];

type Animation = {
  frames: AnimationFrame[],
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
    delay: FRAME_LENGTH
  });
}

function playFloorFireAnimation(source: Unit, targets: Unit[]): Promise<any> {
  const frames: AnimationFrame[] = [];
  for (let i = 0; i < targets.length; i++) {
    const frame: UnitAnimationFrame[] = [];
    frame.push({ unit: source, activity: Activity.STANDING });
    for (let j = 0; j < targets.length; j++) {
      const activity = (j === i) ? Activity.DAMAGED : Activity.STANDING;
      frame.push({ unit: targets[j], activity });
    }
    frames.push(frame);
  }
  // last frame (all standing)
  const frame: UnitAnimationFrame[] = [];
  frame.push({ unit: source, activity: Activity.STANDING });
  for (let i = 0; i < targets.length; i++) {
    frame.push({ unit: targets[i], activity: Activity.STANDING });
  }
  frames.push(frame);
  console.log(frames);
  return _playAnimation({
    frames,
    delay: FRAME_LENGTH
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

        updatePromises.push(unit.sprite.update());
      }
      return Promise.all(updatePromises);
    };
    promises.push(updatePromise);
    promises.push(() => {
      return jwb.renderer.render();
    });
    if (i < (frames.length - 1)) {
      promises.push(() => {
        return wait(delay);
      });
    }
  }

  return chainPromises(promises);
}

export {
  playAttackingAnimation,
  playFloorFireAnimation
};