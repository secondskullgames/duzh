import Unit from '../Unit';
import UnitController from './UnitController';
import GameState from '../../../core/GameState';
import { checkNotNull } from '../../../utils/preconditions';
import UnitBehavior from '../UnitBehaviors';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '../../../utils/random';

type Props = Readonly<{
  state: GameState
}>;

export default class ArcherController implements UnitController {
  private readonly state: GameState;

  constructor({ state }: Props) {
    this.state = state;
  }

  issueOrder = async (unit: Unit) => {
    const playerUnit = this.state.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'ARCHER behavior requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed)) {
      behavior = UnitBehavior.STAY;
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      behavior = UnitBehavior.FLEE_FROM_PLAYER;
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        behavior = UnitBehavior.SHOOT_PLAYER;
      } else if (randChance(aggressiveness)) {
        behavior = UnitBehavior.SHOOT_PLAYER;
      } else {
        behavior = UnitBehavior.WANDER;
      }
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