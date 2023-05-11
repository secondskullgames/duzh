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
import UnitOrder, { type UnitOrderProps } from '../orders/UnitOrder';


export default class WizardController implements UnitController {
  issueOrder = (
    unit: Unit,
    { state, renderer, imageFactory }: UnitControllerProps
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

    // TODO this should be an Order
    if (canSummon && distanceToPlayerUnit >= 3) {
      const coordinates = Direction.values()
        .map(direction => Coordinates.plus(unit.getCoordinates(), direction))
        .find(coordinates => map.contains(coordinates) && !map.isBlocked(coordinates));
      if (coordinates) {
        return {
          execute: async (unit: Unit, { state, renderer, imageFactory }: UnitOrderProps) => {
            await Summon.use(
              unit,
              coordinates,
              { state, renderer, imageFactory }
            );
          }
        };
      }
    }

    return randChoice([
      () => new AvoidUnitOrder({ targetUnit: playerUnit }),
      () => new AttackUnitOrder({ targetUnit: playerUnit }),
      () => new WanderOrder()
    ])();
  }
};