import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean } from '../../../utils/random';
import UnitBehavior from '../behaviors/UnitBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';

type Props = Readonly<{
  state: GameState
}>;

export default class HumanDeterministicController implements UnitController {
  private readonly state: GameState;

  constructor({ state }: Props) {
    this.state = state;
  }

  issueOrder = async (unit: Unit) => {
    const playerUnit = this.state.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'HUMAN_DETERMINISTIC behavior requires aiParams!');
    const { speed, visionRange, fleeThreshold } = aiParameters;

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed)) {
      behavior = new StayBehavior();
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      behavior = new AvoidUnitBehavior({ targetUnit: playerUnit });
    } else if (distanceToPlayer <= visionRange) {
      behavior = new AttackUnitBehavior({ targetUnit: playerUnit });
    } else {
      if (randBoolean()) {
        behavior = new StayBehavior();
      } else {
        behavior = new WanderBehavior();
      }
    }
    return behavior.execute(unit);
  }
};