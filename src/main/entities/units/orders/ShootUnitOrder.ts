import Unit from '../Unit';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import UnitOrder, { OrderContext } from './UnitOrder';
import AttackUnitOrder from './AttackUnitOrder';
import { ShootArrow } from '../abilities/ShootArrow';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class ShootUnitOrder implements UnitOrder {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitOrder#execute} */
  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: OrderContext
  ) => {
    const { targetUnit } = this;
    const map = state.getMap();

    if (unit.getMana() < ShootArrow.manaCost) {
      return this._attack(unit, targetUnit, { state, renderer, imageFactory });
    }

    if (!isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates())) {
      return this._attack(unit, targetUnit, { state, renderer, imageFactory });
    }
    if (manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) <= 1) {
      return this._attack(unit, targetUnit, { state, renderer, imageFactory });
    }

    let { x, y } = unit.getCoordinates();
    const { x: playerX, y: playerY } = targetUnit.getCoordinates();
    const dx = Math.sign(playerX - x);
    const dy = Math.sign(playerY - y);
    x += dx;
    y += dy;

    while (x !== playerX || y !== playerY) {
      if (map.isBlocked({ x, y })) {
        return this._attack(unit, targetUnit, { state, renderer, imageFactory });
      }
      x += dx;
      y += dy;
    }

    return ShootArrow.use(
      unit,
      { x, y },
      {
        state,
        renderer,
        imageFactory
      }
    );
  };

  private _attack = async (
    unit: Unit,
    targetUnit: Unit,
    { state, renderer, imageFactory }: OrderContext
  ) => {
    const behavior = new AttackUnitOrder({ targetUnit });
    return behavior.execute(unit, { state, renderer, imageFactory });
  };
};