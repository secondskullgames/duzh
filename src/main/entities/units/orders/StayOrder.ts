import Unit from '../Unit';
import UnitOrder, { UnitOrderProps } from './UnitOrder';

export default class StayOrder implements UnitOrder {
  /** @override {@link UnitOrder#execute} */
  execute = async (
    unit: Unit,
    { state, renderer }: UnitOrderProps
  ) => {};
}