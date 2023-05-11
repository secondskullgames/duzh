import { UnitController, type UnitControllerProps } from './UnitController';
import Unit from '../Unit';
import { manhattanDistance } from '../../../maps/MapUtils';
import Direction from '../../../geometry/Direction';
import Coordinates from '../../../geometry/Coordinates';
import { randChoice } from '../../../utils/random';
import TeleportAwayOrder from '../orders/TeleportAwayOrder';
import AvoidUnitOrder from '../orders/AvoidUnitOrder';
import AttackUnitOrder from '../orders/AttackUnitOrder';
import WanderOrder from '../orders/WanderOrder';
import { Teleport } from '../abilities/Teleport';
import { Summon } from '../abilities/Summon';
import { AbilityName } from '../abilities/AbilityName';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';


export default class WizardController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (
    unit: Unit,
    { state }: UnitControllerProps
  ): UnitOrder => {
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

    return randChoice([
      () => new AvoidUnitOrder({ targetUnit: playerUnit }),
      () => new AttackUnitOrder({ targetUnit: playerUnit }),
      () => new WanderOrder()
    ])();
  }
};