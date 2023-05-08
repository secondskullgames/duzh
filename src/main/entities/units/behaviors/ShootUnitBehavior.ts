import Unit from '../Unit';
import { UnitAbilities } from '../abilities/UnitAbilities';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import UnitBehavior, { UnitBehaviorProps } from './UnitBehavior';
import AttackUnitBehavior from './AttackUnitBehavior';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';

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
    { state, renderer, animationFactory }: UnitBehaviorProps
  ) => {
    const { targetUnit } = this;
    const map = state.getMap();

    if (unit.getMana() < UnitAbilities.SHOOT_ARROW.manaCost) {
      return this._attack(unit, targetUnit, { state, renderer, animationFactory });
    }

    if (!isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates())) {
      return this._attack(unit, targetUnit, { state, renderer, animationFactory });
    }
    if (manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) <= 1) {
      return this._attack(unit, targetUnit, { state, renderer, animationFactory });
    }

    let { x, y } = unit.getCoordinates();
    const { x: playerX, y: playerY } = targetUnit.getCoordinates();
    const dx = Math.sign(playerX - x);
    const dy = Math.sign(playerY - y);
    x += dx;
    y += dy;

    while (x !== playerX || y !== playerY) {
      if (map.isBlocked({ x, y })) {
        return this._attack(unit, targetUnit, { state, renderer, animationFactory });
      }
      x += dx;
      y += dy;
    }

    return UnitAbilities.SHOOT_ARROW.use(
      unit,
      { x, y },
      {
        state,
        renderer: GameRenderer.getInstance(),
        animationFactory: AnimationFactory.getInstance()
      }
    );
  };

  private _attack = async (
    unit: Unit,
    targetUnit: Unit,
    { state, renderer, animationFactory }: UnitBehaviorProps
  ) => {
    const behavior = new AttackUnitBehavior({ targetUnit });
    return behavior.execute(unit, { state, renderer, animationFactory });
  };
};