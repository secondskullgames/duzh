import { clear, tail } from '@lib/utils/arrays';
import { Globals } from '@main/core/globals';

const maxTurnsAgo = 8;
const maxMessages = 2;

type Message = Readonly<{
  message: string;
  turn: number;
}>;

export default class Ticker {
  private readonly messages: Message[] = [];

  log = (message: string) => {
    const { session } = Globals;
    const turn = session.getTurn();
    this.messages.push({ message, turn });
  };

  getAllMessages = () => this.messages.map(m => m.message);
  getRecentMessages = (turn: number): string[] => {
    return tail(
      this.messages.filter(m => m.turn >= turn - maxTurnsAgo).map(m => m.message),
      maxMessages
    );
  };

  clear = () => {
    clear(this.messages);
  };
}
