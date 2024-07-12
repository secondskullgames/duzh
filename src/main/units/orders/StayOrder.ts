import { OrderType } from '@main/units/orders/UnitOrder';

export type StayOrder = Readonly<{
  type: OrderType.STAY;
}>;

export namespace StayOrder {
  export const create = (): StayOrder => ({ type: OrderType.STAY });
}
