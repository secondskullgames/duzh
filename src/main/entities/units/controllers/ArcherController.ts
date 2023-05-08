import Unit from '../Unit';
import UnitController, { UnitControllerProps } from './UnitController';
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

export default class ArcherController implements UnitController {
  issueOrder = async (unit: Unit, { state, renderer, imageFactory }: UnitControllerProps) => {
    const playerUnit = state.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'ARCHER behavior requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed, { state })) {
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
    return behavior.execute(unit, {
      state,
      renderer,
      imageFactory
    });
  }
};