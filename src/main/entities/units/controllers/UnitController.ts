import { UnitOrder } from '@main/entities/units/orders';
import { GameState, Session } from '@main/core';
import { Unit } from '@main/entities/units';

export interface UnitController {
  issueOrder: (unit: Unit, state: GameState, session: Session) => UnitOrder;
}
