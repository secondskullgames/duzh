import { render } from '../../core/actions';
import GameState from '../../core/GameState';
import { createArrow } from '../../objects/ProjectileFactory';
import Activity from '../../types/Activity';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import { Projectile } from '../../types/types';
import Unit from '../../units/Unit';
import { wait } from '../../utils/promises';

const FRAME_LENGTH = 150; // milliseconds
const PROJECTILE_FRAME_LENGTH = 40; // milliseconds
const WIZARD_TELEPORT_FRAME_LENGTH = 60; // milliseconds

type UnitAnimationFrame = {
  unit: Unit,
  activity: Activity,
  frameNumber?: number,
  direction?: Direction
};

type AnimationFrame = {
  units: UnitAnimationFrame[],
  projectiles?: Projectile[]
};

type Animation = {
  frames: AnimationFrame[],
  delay: number
};

const playAttackingAnimation = async (source: Unit, target: Unit) => _playAnimation({
  frames: [
    {
      units: [
        { unit: source, activity: 'ATTACKING' },
        { unit: target, activity: 'DAMAGED' }
      ],
    },
    {
      units: [
        { unit: source, activity: 'STANDING' },
        { unit: target, activity: 'STANDING' }
      ]
    }
  ],
  delay: FRAME_LENGTH
});

const playArrowAnimation = async (source: Unit, direction: Direction, coordinatesList: Coordinates[], target: Unit | null) => {
  const frames: AnimationFrame[] = [];
  // first frame
  {
    const frame: AnimationFrame = {
      units: [{ unit: source, activity: 'SHOOTING' }]
    };
    if (target) {
      frame.units.push({ unit: target, activity: 'STANDING' });
    }
    frames.push(frame);
  }

  // arrow movement frames
  for (const { x, y } of coordinatesList) {
    const projectile = await createArrow({ x, y }, direction);
    const frame: AnimationFrame = {
      units: [{ unit: source, activity: 'SHOOTING' }],
      projectiles: [projectile]
    };
    if (target) {
      frame.units.push({ unit: target, activity: 'STANDING' });
    }

    frames.push(frame);
  }

  // last frames
  {
    const frame: AnimationFrame = {
      units: [
        { unit: source, activity: 'STANDING' }
      ]
    };
    if (target) {
      frame.units.push({ unit: target, activity: 'DAMAGED' });
    }

    frames.push(frame);
  }
  {
    const frame: AnimationFrame = {
      units: [{ unit: source, activity: 'STANDING' }]
    };
    if (target) {
      frame.units.push({ unit: target, activity: 'STANDING' });
    }

    frames.push(frame);
  }

  return _playAnimation({
    frames,
    delay: PROJECTILE_FRAME_LENGTH
  });
};

const playFloorFireAnimation = async (source: Unit, targets: Unit[]) => {
  const frames: AnimationFrame[] = [];
  for (let i = 0; i < targets.length; i++) {
    const frame: UnitAnimationFrame[] = [];
    frame.push({ unit: source, activity: 'STANDING' });
    for (let j = 0; j < targets.length; j++) {
      const activity = (j === i) ? 'DAMAGED' : 'STANDING';
      frame.push({ unit: targets[j], activity });
    }
    frames.push({ units: frame });
  }

  // last frame (all standing)
  const frame: UnitAnimationFrame[] = [];
  frame.push({ unit: source, activity: 'STANDING' });
  for (let i = 0; i < targets.length; i++) {
    frame.push({ unit: targets[i], activity: 'STANDING' });
  }
  frames.push({ units: frame });

  return _playAnimation({
    frames,
    delay: FRAME_LENGTH
  });
};

const playWizardVanishingAnimation = async (source: Unit) => _playAnimation({
  frames: [
    { units: [{ unit: source, activity: 'VANISHING', frameNumber: 1 }] },
    { units: [{ unit: source, activity: 'VANISHING', frameNumber: 2 }] },
    { units: [{ unit: source, activity: 'VANISHING', frameNumber: 3 }] },
    { units: [{ unit: source, activity: 'VANISHING', frameNumber: 4 }] }
  ],
  delay: WIZARD_TELEPORT_FRAME_LENGTH
});

const playWizardAppearingAnimation = async (source: Unit) => _playAnimation({
  frames: [
    { units: [{ unit: source, activity: 'APPEARING', frameNumber: 1 }] },
    { units: [{ unit: source, activity: 'APPEARING', frameNumber: 2 }] },
    { units: [{ unit: source, activity: 'APPEARING', frameNumber: 3 }] },
    { units: [{ unit: source, activity: 'APPEARING', frameNumber: 4 }] },
    { units: [{ unit: source, activity: 'STANDING', direction: Direction.S }] },
  ],
  delay: WIZARD_TELEPORT_FRAME_LENGTH
});

const _playAnimation = async (animation: Animation) => {
  const { delay, frames } = animation;
  const map = GameState.getInstance().getMap();

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (!!frame.projectiles) {
      map.projectiles.push(...frame.projectiles);
    }
    for (let j = 0; j < frame.units.length; j++) {
      const { unit, activity, frameNumber, direction } = frame.units[j];
      unit.activity = activity;
      unit.frameNumber = frameNumber || 1;
      unit.direction = direction || unit.direction;
    }

    await render();

    if (i < (frames.length - 1)) {
      await wait(delay);
    }

    for (const projectile of (frame.projectiles || [])) {
      map.removeProjectile(projectile);
    }
  }
};

export {
  playArrowAnimation,
  playAttackingAnimation,
  playFloorFireAnimation,
  playWizardAppearingAnimation,
  playWizardVanishingAnimation
};
