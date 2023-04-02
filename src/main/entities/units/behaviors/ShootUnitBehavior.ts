import Unit from '../Unit';
import GameState from '../../../core/GameState';
import { UnitAbilities } from '../abilities/UnitAbilities';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import UnitBehavior from './UnitBehavior';
import AttackUnitBehavior from './AttackUnitBehavior';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class ShootUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#execute} */
  execute = async (unit: Unit): Promise<void> => {
    const { targetUnit } = this;
    const state = GameState.getInstance();
    const map = state.getMap();

    if (unit.getMana() < UnitAbilities.SHOOT_ARROW.manaCost) {
      return this._attack(unit, targetUnit);
    }

    if (!isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates())) {
      return this._attack(unit, targetUnit);
    }
    if (manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) <= 1) {
      return this._attack(unit, targetUnit);
    }

    let { x, y } = unit.getCoordinates();
    const { x: playerX, y: playerY } = targetUnit.getCoordinates();
    const dx = Math.sign(playerX - x);
    const dy = Math.sign(playerY - y);
    x += dx;
    y += dy;

    while (x !== playerX || y !== playerY) {
      if (map.isBlocked({ x, y })) {
        return this._attack(unit, targetUnit);
      }
      x += dx;
      y += dy;
    }

    return UnitAbilities.SHOOT_ARROW.use(unit, { x, y });
  };

  private _attack = async (unit: Unit, targetUnit: Unit) => {
    return new AttackUnitBehavior({ targetUnit }).execute(unit);
  };
};