import Unit from '../../entities/units/Unit';
import Activity from '../../entities/units/Activity';
import Direction from '../../geometry/Direction';
import Projectile from '../../entities/Projectile';

export type UnitAnimationFrame = {
  unit: Unit;
  activity: Activity;
  frameNumber?: number;
  direction?: Direction;
};

export type AnimationFrame = Readonly<{
  units: UnitAnimationFrame[];
  projectiles?: Projectile[];
  postDelay?: number;
}>;

export type Animation = Readonly<{
  frames: AnimationFrame[];
}>;
