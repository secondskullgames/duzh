import Unit from '../../entities/units/Unit';
import Activity from '../../types/Activity';
import Direction from '../../geometry/Direction';
import Projectile from '../../types/Projectile';

export type UnitAnimationFrame = {
  unit: Unit,
  activity: Activity,
  frameNumber?: number,
  direction?: Direction
};

export type AnimationFrame = Readonly<{
  units: UnitAnimationFrame[],
  projectiles?: Projectile[]
}>;

export type Animation = Readonly<{
  frames: AnimationFrame[],
  delay: number
}>;