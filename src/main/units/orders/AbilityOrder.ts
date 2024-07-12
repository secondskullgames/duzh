import { UnitAbility } from '@main/abilities/UnitAbility';
import { Direction } from '@lib/geometry/Direction';
import { OrderType } from '@main/units/orders/UnitOrder';

export type AbilityOrder = Readonly<{
  type: OrderType.ABILITY;
  ability: UnitAbility;
  direction: Direction;
}>;

type Props = Omit<AbilityOrder, 'type'>;

export namespace AbilityOrder {
  export const create = (props: Props): AbilityOrder => ({
    ...props,
    type: OrderType.ABILITY
  });
}
