import Unit from '../Unit';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import UnitBehavior, { UnitBehaviorProps } from './UnitBehavior';
import AttackUnitBehavior from './AttackUnitBehavior';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import { ShootArrow } from '../abilities/ShootArrow';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class ShootUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#execute} */
  execute = async (
    unit: Unit,
    { state, renderer }: UnitBehaviorProps
  ) => {
    const { targetUnit } = this;
    const map = state.getMap();

    if (unit.getMana() < ShootArrow.manaCost) {
      return this._attack(unit, targetUnit, { state, renderer });
    }

    if (!isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates())) {
      return this._attack(unit, targetUnit, { state, renderer });
    }
    if (manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) <= 1) {
      return this._attack(unit, targetUnit, { state, renderer });
    }

    let { x, y } = unit.getCoordinates();
    const { x: playerX, y: playerY } = targetUnit.getCoordinates();
    const dx = Math.sign(playerX - x);
    const dy = Math.sign(playerY - y);
    x += dx;
    y += dy;

    while (x !== playerX || y !== playerY) {
      if (map.isBlocked({ x, y })) {
        return this._attack(unit, targetUnit, { state, renderer });
      }
      x += dx;
      y += dy;
    }

    return ShootArrow.use(
      unit,
      { x, y },
      {
        state,
        renderer: GameRenderer.getInstance()
      }
    );
  };

  private _attack = async (
    unit: Unit,
    targetUnit: Unit,
    { state, renderer }: UnitBehaviorProps
  ) => {
    const behavior = new AttackUnitBehavior({ targetUnit });
    return behavior.execute(unit, { state, renderer });
  };
};