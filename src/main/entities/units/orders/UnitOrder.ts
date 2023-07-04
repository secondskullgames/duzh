import Unit from '../Unit';
import { GlobalContext } from '../../../core/GlobalContext';


export default interface UnitOrder {
  execute: (
    unit: Unit,
    context: GlobalContext
  ) => Promise<void>
};