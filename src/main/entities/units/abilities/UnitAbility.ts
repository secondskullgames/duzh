import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';
import GameState from '../../../core/GameState';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import GameRenderer from '../../../graphics/renderers/GameRenderer';

export type AbilityName =
  | 'ATTACK'
  | 'HEAVY_ATTACK'
  | 'KNOCKBACK_ATTACK'
  | 'STUN_ATTACK'
  | 'SHOOT_ARROW'
  | 'DASH'
  | 'TELEPORT'
  | 'SUMMON'
  | 'BOLT'
  | 'STRAFE'
  | 'PIERCE';

type Props = Readonly<{
  name: string,
  manaCost: number,
  icon?: string | null
}>;

export type UnitAbilityProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  animationFactory: AnimationFactory
}>;

export default abstract class UnitAbility {
  readonly name: string;
  readonly manaCost: number;
  readonly icon: string | null;

  protected constructor({ name, manaCost, icon }: Props) {
    this.name = name;
    this.manaCost = manaCost;
    this.icon = icon ?? null;
  }

  abstract use: (
    unit: Unit,
    coordinates: Coordinates | null,
    { state }: UnitAbilityProps
  ) => Promise<void>;
  abstract getDamageLogMessage: (unit: Unit, target: Unit, damageTaken: number) => string;
}
