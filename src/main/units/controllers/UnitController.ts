import Unit from '../Unit';

interface UnitController {
  issueOrder: (unit: Unit) => Promise<any>;
}

export default UnitController;
