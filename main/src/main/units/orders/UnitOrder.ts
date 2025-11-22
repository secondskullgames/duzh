import { AbilityOrder } from '@main/units/orders/AbilityOrder';
import { AttackOrder } from '@main/units/orders/AttackOrder';
import { MoveOrder } from '@main/units/orders/MoveOrder';
import { SpellOrder } from '@main/units/orders/SpellOrder';
import { StayOrder } from '@main/units/orders/StayOrder';

/**
 * A UnitOrder is a single action that will consume the unit's turn.
 */
export type UnitOrder = AbilityOrder | AttackOrder | MoveOrder | SpellOrder | StayOrder;

export enum OrderType {
  ABILITY = 'ABILITY',
  ATTACK = 'ATTACK',
  MOVE = 'MOVE',
  SPELL = 'SPELL',
  STAY = 'STAY'
}
