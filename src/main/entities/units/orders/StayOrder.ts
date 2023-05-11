import Unit from '../Unit';
import UnitOrder, { OrderContext } from './UnitOrder';

export default class StayOrder implements UnitOrder {
  /** @override {@link UnitOrder#execute} */
  execute = async (
    unit: Unit,
    { state, renderer }: OrderContext
  ) => {};
}