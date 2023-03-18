import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import UnitBehavior from '../UnitBehaviors';
import { weightedRandom } from '../../../utils/random';
import { canMove } from './ControllerUtils';

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
      behavior = UnitBehavior.STAY;
    } else if (distanceToPlayer === 1) {
      behavior = weightedRandom({
        'ATTACK_PLAYER': 0.7,
        'FLEE_FROM_PLAYER': 0.3
      }, UnitBehavior);
    } else if (distanceToPlayer <= visionRange) {
      behavior = UnitBehavior.ATTACK_PLAYER;
    } else {
      behavior = UnitBehavior.WANDER;
    }
    return behavior(unit);
  }
};