import { clear } from '@main/utils/arrays';
import { Session } from '@main/core/Session';
import Coordinates from '@main/geometry/Coordinates';
import Unit from '@main/entities/units/Unit';

export enum EventType {
  COMBAT_DAMAGE = 'COMBAT_DAMAGE',
  EQUIPMENT_EQUIPPED = 'EQUIPMENT_EQUIPPED',
  ITEM_PICKED_UP = 'ITEM_PICKED_UP',
  ITEM_USED = 'ITEM_USED',
  SPELL_USED = 'SPELL_USED',
  LEVELED_UP = 'LEVELED_UP',
  UNIT_DIED = 'UNIT_DIED'
}

export type Event = Readonly<{
  type: EventType;
  sessionId: string;
  message: string;
  turn: number;
  timestamp: Date;
  coordinates?: Coordinates;
  shortMessage?: string;
}>;

export default class EventLog {
  private readonly events: Event[] = [];

  logCombatDamage = (
    attacker: Unit,
    defender: Unit,
    amount: number,
    message: string,
    session: Session
  ) => {
    this.log({
      type: EventType.COMBAT_DAMAGE,
      message,
      sessionId: session.id,
      turn: session.getTurn(),
      timestamp: new Date(),
      coordinates: attacker.getCoordinates(),
      shortMessage: `${amount}`
    });
  };

  log = (event: Event) => {
    this.events.push(event);
  };

  getAllEvents = () => this.events;

  clear = () => {
    clear(this.events);
  };
}
