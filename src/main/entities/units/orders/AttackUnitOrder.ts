import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Pathfinder from '../../../geometry/Pathfinder';
import UnitOrder, { type UnitOrderProps } from './UnitOrder';
import { NormalAttack } from '../abilities/NormalAttack';
import { UnitAbility } from '../abilities/UnitAbility';
import { AbilityName } from '../abilities/AbilityName';
import { randChoice } from '../../../utils/random';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class AttackUnitOrder implements UnitOrder {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitOrder#execute} */
  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: UnitOrderProps
  ) => {
    const { targetUnit } = this;
    const map = state.getMap();
    const mapRect = map.getRect();
    const unblockedTiles: Coordinates[] = [];

    for (let y = 0; y < mapRect.height; y++) {
      for (let x = 0; x < mapRect.width; x++) {
        const coordinates = { x, y };
        if (Coordinates.equals(coordinates, targetUnit.getCoordinates())) {
          unblockedTiles.push(coordinates);
        } else if (!map.isBlocked(coordinates)) {
          unblockedTiles.push(coordinates);
        } else {
          // blocked
        }
      }
    }

    const path: Coordinates[] = new Pathfinder(() => 1).findPath(unit.getCoordinates(), targetUnit.getCoordinates(), unblockedTiles);

    if (path.length > 1) {
      const coordinates = path[1]; // first tile is the unit's own tile
      const unitAtPoint = map.getUnit(coordinates);
      if (unitAtPoint === null || unitAtPoint === targetUnit) {
        const ability = this._chooseAbility(unit);
        await ability.use(
          unit,
          coordinates,
          { state, renderer, imageFactory }
        );
      }
    }
  };

  private _chooseAbility = (unit: Unit): UnitAbility => {
    const allowedSpecialAbilityNames = [
      AbilityName.HEAVY_ATTACK,
      AbilityName.KNOCKBACK_ATTACK,
      AbilityName.STUN_ATTACK
    ];

    const possibleAbilities = unit.getAbilities()
      .filter(ability => allowedSpecialAbilityNames.includes(ability.name))
      .filter(ability => unit.getMana() >= ability.manaCost);

    if (possibleAbilities.length > 0) {
      return randChoice(possibleAbilities);
    }
    return NormalAttack;
  }
}