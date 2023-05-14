import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { UnitController, UnitControllerContext } from '../controllers/UnitController';
import StayOrder from '../orders/StayOrder';

export default class StayBehavior implements UnitController {
  /** @override {@link UnitController#issueOrder} */
  issueOrder = (
    unit: Unit,
    { state }: UnitControllerContext
  ): UnitOrder => {
    return new StayOrder();
  };
}