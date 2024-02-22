import { UnitController } from './UnitController';
import { canMove } from './ControllerUtils';
import Unit from '../Unit';
import { manhattanDistance } from '../../../maps/MapUtils';
import Direction from '../../../geometry/Direction';
import Coordinates from '../../../geometry/Coordinates';
import { randChance } from '../../../utils/random';
import TeleportAwayOrder from '../orders/TeleportAwayOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import { Teleport } from '../abilities/Teleport';
import { Summon } from '../abilities/Summon';
import { AbilityName } from '../abilities/AbilityName';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import MapInstance from '../../../maps/MapInstance';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';
import StayOrder from '../orders/StayOrder';
import { checkNotNull } from '../../../utils/preconditions';

const maxSummonedUnits = 3;
const summonChance = 0.1;
const avoidChance = 0.75;

const _countUnits = (map: MapInstance, summonedUnitClass: string): number => {
  return map.getAllUnits().filter(unit => unit.getUnitClass() === summonedUnitClass)
    .length;
};

export default class WizardController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const playerUnit = session.getPlayerUnit();
    const map = session.getMap();

    const distanceToPlayerUnit = manhattanDistance(
      unit.getCoordinates(),
      playerUnit.getCoordinates()
    );

    const canTeleport =
      unit.hasAbility(AbilityName.TELEPORT) && unit.getMana() >= Teleport.manaCost;
    const canSummon =
      unit.hasAbility(AbilityName.SUMMON) &&
      unit.getMana() >= Summon.manaCost &&
      _countUnits(map, unit.getSummonedUnitClass()!) <= maxSummonedUnits;

    if (canTeleport && distanceToPlayerUnit <= 2) {
      return new TeleportAwayOrder({ targetUnit: playerUnit });
    }

    if (canSummon && randChance(summonChance)) {
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

    const aiParameters = checkNotNull(unit.getAiParameters());
    if (!canMove(aiParameters.speed, session)) {
      return new StayOrder();
    }

    const behavior = randChance(avoidChance)
      ? new AvoidUnitBehavior({ targetUnit: playerUnit })
      : new WanderBehavior();
    return behavior.issueOrder(unit, state, session);
  };
}
