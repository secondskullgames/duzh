import { Coordinates } from '@duzh/geometry';
import { OrderType } from '@main/units/orders/UnitOrder';

export type MoveOrder = Readonly<{
  type: OrderType.MOVE;
  coordinates: Coordinates;
}>;

type Props = Omit<MoveOrder, 'type'>;

export namespace MoveOrder {
  export const create = (props: Props): MoveOrder => ({
    ...props,
    type: OrderType.MOVE
  });
}
