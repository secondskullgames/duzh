import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../core/GameState';
import { manhattanDistance } from '../../maps/MapUtils';
import UnitBehaviors from '../UnitBehaviors';
import Direction from '../../geometry/Direction';
import Coordinates from '../../geometry/Coordinates';
import { randChoice } from '../../utils/random';
import { UnitAbilities } from '../abilities/UnitAbilities';

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
      return UnitBehaviors.TELEPORT_FROM_PLAYER(unit);
    }

    if (canSummon && distanceToPlayerUnit >= 3) {
      const coordinates = Direction.values()
        .map(direction => Coordinates.plus(unit.getCoordinates(), direction))
        .filter(coordinates => map.contains(coordinates) && !map.isBlocked(coordinates))
        [0];
      if (coordinates) {
        return UnitAbilities.SUMMON.use(unit, coordinates);
      }
    }

    return randChoice([
      UnitBehaviors.FLEE_FROM_PLAYER,
      UnitBehaviors.ATTACK_PLAYER,
      UnitBehaviors.WANDER
    ])(unit);
  }
};