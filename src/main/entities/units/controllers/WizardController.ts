import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import { manhattanDistance } from '../../../maps/MapUtils';
import Direction from '../../../geometry/Direction';
import Coordinates from '../../../geometry/Coordinates';
import { randChoice } from '../../../utils/random';
import { UnitAbilities } from '../abilities/UnitAbilities';
import TeleportAwayBehavior from '../behaviors/TeleportAwayBehavior';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';

type Props = Readonly<{
  state: GameState
}>;

export default class WizardController implements UnitController {
  private readonly state: GameState;

  constructor({ state }: Props) {
    this.state = state;
  }

  issueOrder = async (unit: Unit) => {
    const { state } = this;
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();

    const distanceToPlayerUnit = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    const canTeleport = unit.getAbilities().includes(UnitAbilities.TELEPORT)
      && unit.getMana() >= UnitAbilities.TELEPORT.manaCost;
    const canSummon = unit.getAbilities().includes(UnitAbilities.SUMMON)
      && unit.getMana() >= UnitAbilities.SUMMON.manaCost;

    if (canTeleport && distanceToPlayerUnit <= 3) {
      return new TeleportAwayBehavior({ targetUnit: playerUnit }).execute(unit, {
        state,
        renderer: GameRenderer.getInstance(),
        animationFactory: AnimationFactory.getInstance()
      });
    }

    // TODO should this be a Behavior?
    if (canSummon && distanceToPlayerUnit >= 3) {
      const coordinates = Direction.values()
        .map(direction => Coordinates.plus(unit.getCoordinates(), direction))
        .find(coordinates => map.contains(coordinates) && !map.isBlocked(coordinates));
      if (coordinates) {
        return UnitAbilities.SUMMON.use(
          unit,
          coordinates,
          {
            state,
            renderer: GameRenderer.getInstance(),
            animationFactory: AnimationFactory.getInstance()
          }
        );
      }
    }

    const behavior = randChoice([
      () => new AvoidUnitBehavior({ targetUnit: playerUnit }),
      () => new AttackUnitBehavior({ targetUnit: playerUnit }),
      () => new WanderBehavior()
    ])();
    return behavior.execute(unit, {
      state,
      renderer: GameRenderer.getInstance(),
      animationFactory: AnimationFactory.getInstance()
    });
  }
};