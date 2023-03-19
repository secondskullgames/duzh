import Unit from '../Unit';
import UnitController from './UnitController';
import GameState from '../../../core/GameState';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '../../../utils/random';
import UnitBehavior from '../behaviors/UnitBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import ShootUnitBehavior from '../behaviors/ShootUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';

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
      behavior = new StayBehavior();
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      behavior = new AvoidUnitBehavior({ targetUnit: playerUnit });
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        behavior = new ShootUnitBehavior({ targetUnit: playerUnit });
      } else if (randChance(aggressiveness)) {
        behavior = new ShootUnitBehavior({ targetUnit: playerUnit });
      } else {
        behavior = new WanderBehavior();
      }
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