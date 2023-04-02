import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';

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

export default abstract class UnitAbility {
  readonly name: string;
  readonly manaCost: number;
  readonly icon: string | null;

  protected constructor({ name, manaCost, icon }: Props) {
    this.name = name;
    this.manaCost = manaCost;
    this.icon = icon ?? null;
  }

  abstract use(unit: Unit, coordinates: Coordinates | null): Promise<void>;
  abstract getDamageLogMessage(unit: Unit, target: Unit, damageTaken: number): string;
}
