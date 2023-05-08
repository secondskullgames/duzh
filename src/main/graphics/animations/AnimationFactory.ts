import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Unit from '../../entities/units/Unit';
import ProjectileFactory from '../../entities/objects/ProjectileFactory';
import { Animation, AnimationFrame, UnitAnimationFrame } from './Animation';
import { checkNotNull } from '../../utils/preconditions';

const FRAME_LENGTH = 150; // milliseconds
const ARROW_FRAME_LENGTH = 50; // milliseconds
const BOLT_FRAME_LENGTH = 50; // milliseconds
const WIZARD_TELEPORT_FRAME_LENGTH = 60; // milliseconds

type Props = Readonly<{
  state: GameState,
  projectileFactory: ProjectileFactory
}>;

export default class AnimationFactory {
  private readonly state: GameState;
  private readonly projectileFactory: ProjectileFactory

  constructor({ state, projectileFactory }: Props) {
    this.state = state;
    this.projectileFactory = projectileFactory;
  }

  getAttackingAnimation = (source: Unit, target?: Unit): Animation => {
    const frameLength = 150;
    if (target) {
      return {
        frames: [
          {
            units: [
              { unit: source, activity: 'ATTACKING' },
              { unit: target, activity: 'DAMAGED' }
            ],
            postDelay: frameLength,
          },
          {
            units: [
              { unit: source, activity: 'STANDING' },
              { unit: target, activity: 'STANDING' }
            ]
          }
        ]
      };
    } else {
      return {
        frames: [
          {
            units: [
              { unit: source, activity: 'ATTACKING' }
            ],
            postDelay: frameLength
          },
          {
            units: [
              { unit: source, activity: 'STANDING' }
            ]
          }
        ]
      };
    }
  };

  getArrowAnimation = async (
    source: Unit,
    direction: Direction,
    coordinatesList: Coordinates[],
    target: Unit | null
  ): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    // first frame
    {
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: 'SHOOTING' }],
        postDelay: ARROW_FRAME_LENGTH
      };
      if (target) {
        frame.units.push({ unit: target, activity: 'STANDING' });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(coordinates => this.state.getMap().isTileRevealed(coordinates));

    // arrow movement frames
    for (const coordinates of visibleCoordinatesList) {
      const projectile = await this.projectileFactory.createArrow(coordinates, direction);
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: 'SHOOTING' }],
        projectiles: [projectile],
        postDelay: ARROW_FRAME_LENGTH
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
        ],
        postDelay: ARROW_FRAME_LENGTH
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

    return {
      frames
    };
  };

  getBoltAnimation = async (
    source: Unit,
    direction: Direction,
    coordinatesList: Coordinates[],
    target: Unit | null
  ): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    // first frame
    {
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: 'ATTACKING' }],
        postDelay: BOLT_FRAME_LENGTH
      };
      if (target) {
        frame.units.push({ unit: target, activity: 'STANDING' });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(this.state.getMap().isTileRevealed);

    // bolt movement frames
    for (const coordinates of visibleCoordinatesList) {
      const projectile = await this.projectileFactory.createBolt(coordinates, direction);
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: 'ATTACKING' }],
        projectiles: [projectile],
        postDelay: BOLT_FRAME_LENGTH
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

    return {
      frames
    };
  };

  getFloorFireAnimation = async (source: Unit, targets: Unit[]): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    for (let i = 0; i < targets.length; i++) {
      const unitFrames: UnitAnimationFrame[] = [];
      unitFrames.push({ unit: source, activity: 'STANDING' });

      for (let j = 0; j < targets.length; j++) {
        const activity = (j === i) ? 'BURNED' : 'STANDING';
        unitFrames.push({ unit: targets[j], activity });
      }

      const frame = {
        units: unitFrames,
        postDelay: FRAME_LENGTH
      };
      frames.push(frame);
    }

    // last frame (all standing)
    const unitFrames: UnitAnimationFrame[] = [];
    unitFrames.push({ unit: source, activity: 'STANDING' });
    for (let i = 0; i < targets.length; i++) {
      unitFrames.push({ unit: targets[i], activity: 'STANDING' });
    }
    const frame = {
      units: unitFrames
    };
    frames.push(frame);

    return {
      frames
    };
  };

  getWizardVanishingAnimation = async (source: Unit): Promise<Animation> => ({
    frames: [
      {
        units: [{ unit: source, activity: 'VANISHING', frameNumber: 1 }],
        postDelay: WIZARD_TELEPORT_FRAME_LENGTH
      },
      {
        units: [{ unit: source, activity: 'VANISHING', frameNumber: 2 }],
        postDelay: WIZARD_TELEPORT_FRAME_LENGTH
      },
      {
        units: [{ unit: source, activity: 'VANISHING', frameNumber: 3 }],
        postDelay: WIZARD_TELEPORT_FRAME_LENGTH
      },
      {
        units: [{ unit: source, activity: 'VANISHING', frameNumber: 4 }]
      }
    ]
  });

  getWizardAppearingAnimation = async (source: Unit): Promise<Animation> => ({
    frames: [
      {
        units: [{ unit: source, activity: 'APPEARING', frameNumber: 1 }],
        postDelay: WIZARD_TELEPORT_FRAME_LENGTH
      },
      {
        units: [{ unit: source, activity: 'APPEARING', frameNumber: 2 }],
        postDelay: WIZARD_TELEPORT_FRAME_LENGTH
      },
      {
        units: [{ unit: source, activity: 'APPEARING', frameNumber: 3 }],
        postDelay: WIZARD_TELEPORT_FRAME_LENGTH
      },
      {
        units: [{ unit: source, activity: 'APPEARING', frameNumber: 4 }],
        postDelay: WIZARD_TELEPORT_FRAME_LENGTH
      },
      {
        units: [{ unit: source, activity: 'STANDING', direction: Direction.S }]
      },
    ]
  });

  private static instance: AnimationFactory | null;
  static getInstance = (): AnimationFactory => checkNotNull(AnimationFactory.instance);
  static setInstance = (factory: AnimationFactory) => { AnimationFactory.instance = factory; };
}