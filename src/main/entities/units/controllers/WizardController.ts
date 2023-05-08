import UnitController, { UnitControllerProps } from './UnitController';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import { manhattanDistance } from '../../../maps/MapUtils';
import Direction from '../../../geometry/Direction';
import Coordinates from '../../../geometry/Coordinates';
import { randChoice } from '../../../utils/random';
import TeleportAwayBehavior from '../behaviors/TeleportAwayBehavior';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import { Teleport } from '../abilities/Teleport';
import { Summon } from '../abilities/Summon';
import { AbilityName } from '../abilities/AbilityName';


export default class WizardController implements UnitController {
  issueOrder = async (unit: Unit, { state, renderer, imageFactory }: UnitControllerProps) => {
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();

    const distanceToPlayerUnit = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    const canTeleport = unit.getAbilities().find(ability => ability.name === AbilityName.TELEPORT)
      && unit.getMana() >= Teleport.manaCost;
    const canSummon = unit.getAbilities().find(ability => ability.name === AbilityName.TELEPORT)
      && unit.getMana() >= Summon.manaCost;

    if (canTeleport && distanceToPlayerUnit <= 3) {
      return new TeleportAwayBehavior({ targetUnit: playerUnit }).execute(unit, {
        state,
        renderer,
        imageFactory
      });
    }

    // TODO should this be a Behavior?
    if (canSummon && distanceToPlayerUnit >= 3) {
      const coordinates = Direction.values()
        .map(direction => Coordinates.plus(unit.getCoordinates(), direction))
        .find(coordinates => map.contains(coordinates) && !map.isBlocked(coordinates));
      if (coordinates) {
        return Summon.use(
          unit,
          coordinates,
          { state, renderer, imageFactory }
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
      renderer,
      imageFactory
    });
  }
};