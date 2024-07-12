import { OrderType } from './UnitOrder';
import { Direction } from '@lib/geometry/Direction';

/**
 * An order in which the unit moves in the specified direction,
 * or attacks a target if one is present.
 */
export type AttackOrder = Readonly<{
  type: OrderType.ATTACK;
  direction: Direction;
}>;

type Props = Omit<AttackOrder, 'type'>;

export namespace AttackOrder {
  export const create = (props: Props): AttackOrder => ({
    ...props,
    type: OrderType.ATTACK
  });
}
