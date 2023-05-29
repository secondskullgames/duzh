import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Unit from '../../entities/units/Unit';
import ProjectileFactory from '../../entities/objects/ProjectileFactory';
import { Animation, AnimationFrame, UnitAnimationFrame } from './Animation';
import ImageFactory from '../images/ImageFactory';
import Activity from '../../entities/units/Activity';
import { LONG_SLEEP, SHORT_SLEEP } from '../../utils/promises';

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export default {
  getArrowAnimation: async (
    source: Unit,
    direction: Direction,
    coordinatesList: Coordinates[],
    target: Unit | null,
    { state, imageFactory }: Props
  ): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    // first frame
    {
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.SHOOTING }],
        postDelay: SHORT_SLEEP
      };
      if (target) {
        frame.units.push({ unit: target, activity: Activity.STANDING });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(coordinates => state.getMap().isTileRevealed(coordinates));

    // arrow movement frames
    for (const coordinates of visibleCoordinatesList) {
      const projectile = await ProjectileFactory.createArrow(
        coordinates,
        direction,
        { imageFactory }
      );
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.SHOOTING }],
        projectiles: [projectile],
        postDelay: SHORT_SLEEP
      };
      if (target) {
        frame.units.push({ unit: target, activity: Activity.STANDING });
      }

      frames.push(frame);
    }

    // last frames
    {
      const frame: AnimationFrame = {
        units: [
          { unit: source, activity: Activity.STANDING }
        ],
        postDelay: SHORT_SLEEP
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

    return {
      frames
    };
  },

  getBoltAnimation: async (
    source: Unit,
    direction: Direction,
    coordinatesList: Coordinates[],
    target: Unit | null,
    { state, imageFactory }: Props
  ): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    // first frame
    {
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.ATTACKING }],
        postDelay: SHORT_SLEEP
      };
      if (target) {
        frame.units.push({ unit: target, activity: Activity.STANDING });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(state.getMap().isTileRevealed);

    // bolt movement frames
    for (const coordinates of visibleCoordinatesList) {
      const projectile = await ProjectileFactory.createBolt(coordinates, direction, {
        imageFactory
      });
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.ATTACKING }],
        projectiles: [projectile],
        postDelay: SHORT_SLEEP
      };
      if (target) {
        frame.units.push({ unit: target, activity: Activity.STANDING });
      }

      frames.push(frame);
    }

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

    return {
      frames
    };
  },

  getFloorFireAnimation: async (
    source: Unit,
    targets: Unit[],
    { state }: Props
  ): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    for (let i = 0; i < targets.length; i++) {
      const unitFrames: UnitAnimationFrame[] = [];
      unitFrames.push({ unit: source, activity: Activity.STANDING });

      for (let j = 0; j < targets.length; j++) {
        const activity = (j === i) ? Activity.BURNED : Activity.STANDING;
        unitFrames.push({ unit: targets[j], activity });
      }

      const frame = {
        units: unitFrames,
        postDelay: LONG_SLEEP
      };
      frames.push(frame);
    }

    // last frame (all standing)
    const unitFrames: UnitAnimationFrame[] = [];
    unitFrames.push({ unit: source, activity: Activity.STANDING });
    for (let i = 0; i < targets.length; i++) {
      unitFrames.push({ unit: targets[i], activity: Activity.STANDING });
    }
    const frame = {
      units: unitFrames
    };
    frames.push(frame);

    return {
      frames
    };
  }
};