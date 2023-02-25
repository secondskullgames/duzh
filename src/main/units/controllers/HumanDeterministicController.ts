import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../core/GameState';
import { checkNotNull } from '../../utils/preconditions';
import UnitBehavior from '../UnitBehaviors';
import { manhattanDistance } from '../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean } from '../../utils/random';

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
      behavior = UnitBehavior.STAY;
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      behavior = UnitBehavior.FLEE_FROM_PLAYER;
    } else if (distanceToPlayer <= visionRange) {
      behavior = UnitBehavior.ATTACK_PLAYER;
    } else {
      if (randBoolean()) {
        behavior = UnitBehavior.STAY;
      } else {
        behavior = UnitBehavior.WANDER;
      }
    }
    return behavior(unit);
  }
};