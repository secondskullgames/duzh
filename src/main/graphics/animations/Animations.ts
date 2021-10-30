import Direction from '../../types/Direction';
import Unit from '../../units/Unit';
import { Activity, Coordinates, Projectile } from '../../types/types';
import { wait } from '../../utils/PromiseUtils';
import { createArrow } from '../../items/ProjectileFactory';

const FRAME_LENGTH = 150; // milliseconds
const PROJECTILE_FRAME_LENGTH = 50; // milliseconds

type UnitAnimationFrame = {
  unit: Unit,
  activity: Activity
};

type AnimationFrame = {
  units: UnitAnimationFrame[],
  projectiles?: Projectile[]
};

type Animation = {
  frames: AnimationFrame[],
  delay: number
};

function playAttackingAnimation(source: Unit, target: Unit): Promise<any> {
  return _playAnimation({
    frames: [
      {
        units: [
          { unit: source, activity: Activity.ATTACKING },
          { unit: target, activity: Activity.DAMAGED }
        ],
      },
      {
        units: [
          { unit: source, activity: Activity.STANDING },
          { unit: target, activity: Activity.STANDING }
        ]
      }
    ],
    delay: FRAME_LENGTH
  });
}

function playArrowAnimation(source: Unit, direction: Direction, coordinatesList: Coordinates[], target: Unit | null): Promise<any> {
  const frames: AnimationFrame[] = [];
  // first frame
  {
    const frame: AnimationFrame = {
      units: [{ unit: source, activity: Activity.SHOOTING }]
    };
    if (target) {
      frame.units.push({ unit: target, activity: Activity.STANDING });
    }
    frames.push(frame);
  }

  // arrow movement frames
  coordinatesList.forEach(({ x, y }: Coordinates) => {
    const projectile = createArrow({ x, y }, direction);
    const frame: AnimationFrame = {
      units: [{ unit: source, activity: Activity.SHOOTING }],
      projectiles: [projectile]
    };
    if (target) {
      frame.units.push({ unit: target, activity: Activity.STANDING });
    }

    frames.push(frame);
  });

  // last frames
  {
    const frame: AnimationFrame = {
      units: [
        { unit: source, activity: Activity.STANDING }
      ]
    };
    if (target) {
      frame.units.push({ unit: target, activity: Activity.DAMAGED });
    }

    frames.push(frame);
  }
  {
    const frame: AnimationFrame = {
      units: [{ unit: source, activity: Activity.STANDING }]
    };
    if (target) {
      frame.units.push({ unit: target, activity: Activity.STANDING });
    }

    frames.push(frame);
  }

  return _playAnimation({
    frames,
    delay: PROJECTILE_FRAME_LENGTH
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
    frames.push({ units: frame });
  }
  // last frame (all standing)
  const frame: UnitAnimationFrame[] = [];
  frame.push({ unit: source, activity: Activity.STANDING });
  for (let i = 0; i < targets.length; i++) {
    frame.push({ unit: targets[i], activity: Activity.STANDING });
  }
  frames.push({ units: frame });
  return _playAnimation({
    frames,
    delay: FRAME_LENGTH
  });
}

const _playAnimation = async (animation: Animation) => {
  const { delay, frames } = animation;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const map = jwb.state.getMap();
    if (!!frame.projectiles) {
      map.projectiles.push(...frame.projectiles);
    }
    for (let j = 0; j < frame.units.length; j++) {
      const { unit, activity } = frame.units[j];
      unit.activity = activity;
      await unit.sprite.getImage();
    }
    await jwb.renderer.render();
    if (i < (frames.length - 1)) {
      await wait(delay);
    }

    if (!!frame.projectiles) {
      frame.projectiles.forEach(projectile => map.removeProjectile(projectile));
    }
  }
}

export {
  playAttackingAnimation,
  playArrowAnimation,
  playFloorFireAnimation
};
