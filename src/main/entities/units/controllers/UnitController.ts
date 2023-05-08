import Unit from '../Unit';

interface UnitController {
  issueOrder: (unit: Unit) => Promise<void>;
}

export default UnitController;
