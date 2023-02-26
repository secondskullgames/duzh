import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Unit from '../../units/Unit';
import ProjectileFactory from '../../objects/ProjectileFactory';
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
    if (target) {
      return {
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
      };
    } else {
      return {
        frames: [
          {
            units: [
              { unit: source, activity: 'ATTACKING' }
            ],
          },
          {
            units: [
              { unit: source, activity: 'STANDING' }
            ]
          }
        ],
        delay: FRAME_LENGTH
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
        units: [{ unit: source, activity: 'SHOOTING' }]
      };
      if (target) {
        frame.units.push({ unit: target, activity: 'STANDING' });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(({ x, y }) => this.state.getMap().isTileRevealed({ x, y }));

    // arrow movement frames
    for (const { x, y } of visibleCoordinatesList) {
      const projectile = await this.projectileFactory.createArrow({ x, y }, direction);
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

    return {
      frames,
      delay: ARROW_FRAME_LENGTH
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
        units: [{ unit: source, activity: 'ATTACKING' }]
      };
      if (target) {
        frame.units.push({ unit: target, activity: 'STANDING' });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(this.state.getMap().isTileRevealed);

    // bolt movement frames
    for (const { x, y } of visibleCoordinatesList) {
      // TODO this is still using an arrow sprite
      const projectile = await this.projectileFactory.createArrow({ x, y }, direction);
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: 'ATTACKING' }],
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

    return {
      frames,
      delay: BOLT_FRAME_LENGTH
    };
  };

  getFloorFireAnimation = async (source: Unit, targets: Unit[]): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    for (let i = 0; i < targets.length; i++) {
      const frame: UnitAnimationFrame[] = [];
      frame.push({ unit: source, activity: 'STANDING' });
      for (let j = 0; j < targets.length; j++) {
        const activity = (j === i) ? 'BURNED' : 'STANDING';
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

    return {
      frames,
      delay: FRAME_LENGTH
    };
  };

  getWizardVanishingAnimation = async (source: Unit): Promise<Animation> => ({
    frames: [
      { units: [{ unit: source, activity: 'VANISHING', frameNumber: 1 }] },
      { units: [{ unit: source, activity: 'VANISHING', frameNumber: 2 }] },
      { units: [{ unit: source, activity: 'VANISHING', frameNumber: 3 }] },
      { units: [{ unit: source, activity: 'VANISHING', frameNumber: 4 }] }
    ],
    delay: WIZARD_TELEPORT_FRAME_LENGTH
  });

  getWizardAppearingAnimation = async (source: Unit): Promise<Animation> => ({
    frames: [
      { units: [{ unit: source, activity: 'APPEARING', frameNumber: 1 }] },
      { units: [{ unit: source, activity: 'APPEARING', frameNumber: 2 }] },
      { units: [{ unit: source, activity: 'APPEARING', frameNumber: 3 }] },
      { units: [{ unit: source, activity: 'APPEARING', frameNumber: 4 }] },
      { units: [{ unit: source, activity: 'STANDING', direction: Direction.S }] },
    ],
    delay: WIZARD_TELEPORT_FRAME_LENGTH
  });

  static instance: AnimationFactory | null;
  static getInstance = (): AnimationFactory => checkNotNull(AnimationFactory.instance);
  static setInstance = (factory: AnimationFactory) => { AnimationFactory.instance = factory; };
}