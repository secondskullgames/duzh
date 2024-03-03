import { clear } from '@main/utils/arrays';
import { Session } from '@main/core/Session';

type Event = Readonly<{
  sessionId: string;
  message: string;
  turn: number;
}>;

export default class EventLog {
  private readonly events: Event[] = [];

  log = (message: string, session: Session) => {
    const event = { sessionId: session.id, message, turn: session.getTurn() };
    this.events.push(event);
  };

  getAllEvents = () => this.events;

  clear = () => {
    clear(this.events);
  };
}
