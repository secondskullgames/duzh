import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import { manhattanDistance } from '../../../maps/MapUtils';
import { randChoice, random } from '../../../utils/random';
import UnitBehavior from '../behaviors/UnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import StayBehavior from '../behaviors/StayBehavior';

type Props = Readonly<{
  state: GameState
}>;

export default class HumanAggressiveController implements UnitController {
  private readonly state: GameState;

  constructor({ state }: Props) {
    this.state = state;
  }

  issueOrder = async (unit: Unit) => {
    const playerUnit = this.state.getPlayerUnit();

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (distanceToPlayer === 1) {
      behavior = new AttackUnitBehavior({ targetUnit: playerUnit });
    } else if (distanceToPlayer >= 6) {
      behavior = randChoice([
        () => new WanderBehavior(),
        () => new StayBehavior(),
        () => new AttackUnitBehavior({ targetUnit: playerUnit })
      ])();
    } else {
      behavior = (random() >= 0.1)
        ? new AttackUnitBehavior({ targetUnit: playerUnit })
        : new StayBehavior();
    }
    return behavior.execute(unit, { state: this.state });
  }
};