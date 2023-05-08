import Unit from '../Unit';
import UnitBehavior, { UnitBehaviorProps } from './UnitBehavior';

export default class StayBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#execute} */
  execute = async (unit: Unit, { state }: UnitBehaviorProps) => {};
}