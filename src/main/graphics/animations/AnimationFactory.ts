import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Unit from '../../entities/units/Unit';
import ProjectileFactory from '../../entities/objects/ProjectileFactory';
import { Animation, AnimationFrame, UnitAnimationFrame } from './Animation';
import Activity from '../../entities/units/Activity';
import MapInstance from '../../maps/MapInstance';
import SpriteFactory from '../sprites/SpriteFactory';

type Props = Readonly<{
  spriteFactory: SpriteFactory,
  projectileFactory: ProjectileFactory
}>;

type Context = Readonly<{
  map: MapInstance
}>;

export default class AnimationFactory {
  private readonly spriteFactory: SpriteFactory;
  private readonly projectileFactory: ProjectileFactory;
  
  constructor({ spriteFactory, projectileFactory }: Props) {
    this.spriteFactory = spriteFactory;
    this.projectileFactory = projectileFactory;
  }
  
  getArrowAnimation = async (
    source: Unit,
    direction: Direction,
    coordinatesList: Coordinates[],
    target: Unit | null,
    { map }: Context
  ): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    // first frame
    {
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.SHOOTING }],
        postDelay: 100
      };
      if (target) {
        frame.units.push({ unit: target, activity: Activity.STANDING });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(coordinates => map.isTileRevealed(coordinates));

    // arrow movement frames
    for (const coordinates of visibleCoordinatesList) {
      const projectile = await this.projectileFactory.createArrow(coordinates, direction);
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.SHOOTING }],
        projectiles: [projectile],
        postDelay: 50
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
        postDelay: 100
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
  };

  getBoltAnimation = async (
    source: Unit,
    direction: Direction,
    coordinatesList: Coordinates[],
    target: Unit | null,
    { map }: Context
  ): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    // first frame
    {
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.ATTACKING }],
        postDelay: 100
      };
      if (target) {
        frame.units.push({ unit: target, activity: Activity.STANDING });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(map.isTileRevealed);

    // bolt movement frames
    for (const coordinates of visibleCoordinatesList) {
      const projectile = await this.projectileFactory.createBolt(coordinates, direction);
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.ATTACKING }],
        projectiles: [projectile],
        postDelay: 50
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

    return { frames };
  };

  getFireballAnimation = async (
    source: Unit,
    direction: Direction,
    coordinatesList: Coordinates[],
    target: Unit | null,
    { map }: Context
  ): Promise<Animation> => {
    const frames: AnimationFrame[] = [];
    // first frame
    {
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.SHOOTING }],
        postDelay: 100
      };
      if (target) {
        frame.units.push({ unit: target, activity: Activity.STANDING });
      }
      frames.push(frame);
    }

    const visibleCoordinatesList = coordinatesList.filter(coordinates => map.isTileRevealed(coordinates));

    // arrow movement frames
    for (const coordinates of visibleCoordinatesList) {
      const projectile = await this.projectileFactory.createArrow(
        coordinates,
        direction
      );
      const frame: AnimationFrame = {
        units: [{ unit: source, activity: Activity.SHOOTING }],
        projectiles: [projectile],
        postDelay: 100
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
        postDelay: 100
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

    return { frames };
  };

  getFloorFireAnimation = async (source: Unit, targets: Unit[], context: Context): Promise<Animation> => {
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
        postDelay: 300
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

    return { frames };
  }
};