import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { randChoice } from '../../../utils/random';
import { canMove } from './ControllerUtils';
import WanderBehavior from '../behaviors/WanderBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import UnitBehavior from '../behaviors/UnitBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';

type Props = Readonly<{
  state: GameState
}>;

export default class HumanCautiousController implements UnitController {
  private readonly state: GameState;

  constructor({ state }: Props) {
    this.state = state;
  }

  issueOrder = async (unit: Unit) => {
    const playerUnit = this.state.getPlayerUnit();
    const aiParameters = checkNotNull(unit.getAiParameters(), 'HUMAN_CAUTIOUS behavior requires aiParams!');
    const { speed, visionRange } = aiParameters;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    let behavior: UnitBehavior;

    if (!canMove(speed)) {
      behavior = new StayBehavior();
    } else if (distanceToPlayer === 1) {
      behavior = randChoice([
        () => new AttackUnitBehavior({ targetUnit: playerUnit }),
        () => new AvoidUnitBehavior({ targetUnit: playerUnit })
      ])();
    } else if (distanceToPlayer <= visionRange) {
      behavior = new AttackUnitBehavior({ targetUnit: playerUnit });
    } else {
      behavior = new WanderBehavior();
    }
    return behavior.execute(unit);
  }
};