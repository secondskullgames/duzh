import { OrderType } from './UnitOrder';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Coordinates } from '@duzh/geometry';

export type SpellOrder = Readonly<{
  type: OrderType.SPELL;
  ability: UnitAbility;
  coordinates: Coordinates;
}>;

type Props = Omit<SpellOrder, 'type'>;

export namespace SpellOrder {
  export const create = (props: Props): SpellOrder => ({
    ...props,
    type: OrderType.SPELL
  });
}
