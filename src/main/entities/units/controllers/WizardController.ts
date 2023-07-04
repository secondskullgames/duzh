import { UnitController } from './UnitController';
import Unit from '../Unit';
import { manhattanDistance } from '../../../maps/MapUtils';
import Direction from '../../../geometry/Direction';
import Coordinates from '../../../geometry/Coordinates';
import { randChoice } from '../../../utils/random';
import TeleportAwayOrder from '../orders/TeleportAwayOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import { Teleport } from '../abilities/Teleport';
import { Summon } from '../abilities/Summon';
import { AbilityName } from '../abilities/AbilityName';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { GlobalContext } from '../../../core/GlobalContext';

export default class WizardController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (
    unit: Unit,
    context: GlobalContext
  ): UnitOrder => {
    const { state } = context;
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();

    const distanceToPlayerUnit = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    const canTeleport = unit.getAbilities().find(ability => ability.name === AbilityName.TELEPORT)
      && unit.getMana() >= Teleport.manaCost;
    const canSummon = unit.getAbilities().find(ability => ability.name === AbilityName.TELEPORT)
      && unit.getMana() >= Summon.manaCost;

    if (canTeleport && distanceToPlayerUnit <= 3) {
      return new TeleportAwayOrder({ targetUnit: playerUnit });
    }

    if (canSummon && distanceToPlayerUnit >= 3) {
      const coordinates = Direction.values()
        .map(direction => Coordinates.plus(unit.getCoordinates(), direction))
        .find(coordinates => map.contains(coordinates) && !map.isBlocked(coordinates));
      if (coordinates) {
        return new AbilityOrder({
          ability: Summon,
          coordinates
        });
      }
    }

    const behavior = randChoice([
      () => new AvoidUnitBehavior({ targetUnit: playerUnit }),
      () => new AttackUnitBehavior({ targetUnit: playerUnit }),
      () => new WanderBehavior()
    ])();
    return behavior.issueOrder(unit, { state });
  }
};