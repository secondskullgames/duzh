import Unit from '../Unit';

export default interface UnitBehavior {
  execute: (unit: Unit) => Promise<void>
};