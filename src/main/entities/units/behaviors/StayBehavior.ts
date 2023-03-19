import Unit from '../Unit';
import UnitBehavior from './UnitBehavior';

export default class StayBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#execute} */
  execute = async (unit: Unit) => {};
}