import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../core/GameState';
import UnitBehavior from '../UnitBehaviors';
import { manhattanDistance } from '../../maps/MapUtils';
import { weightedRandom } from '../../utils/random';

export default class HumanAggressiveController implements UnitController {
  issueOrder = async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (distanceToPlayer === 1) {
      behavior = UnitBehavior.ATTACK_PLAYER;
    } else if (distanceToPlayer >= 6) {
      behavior = weightedRandom({
        'WANDER': 0.4,
        'STAY': 0.4,
        'ATTACK_PLAYER': 0.2
      }, UnitBehavior);
    } else {
      behavior = weightedRandom({
        'ATTACK_PLAYER': 0.9,
        'STAY': 0.1
      }, UnitBehavior);
    }
    return behavior(unit);
  }
};