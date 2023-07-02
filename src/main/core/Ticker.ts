import { clear, tail } from '../utils/arrays';

const maxTurnsAgo = 8;
const maxMessages = 4;

type Message = Readonly<{
  message: string,
  turn: number
}>;

type Context = Readonly<{
  turn: number
}>;

export default class Ticker {
  private readonly _messages: Message[] = [];

  log = (message: string, { turn }: Context) => {
    this._messages.push({ message, turn });
  };

  getAllMessages = () => this._messages.map(m => m.message);
  getRecentMessages = (turn: number): string[] => {
    return tail(
      this._messages.filter(m => m.turn >= turn - maxTurnsAgo).map(m => m.message),
      maxMessages
    );
  };

  clear = () => {
    clear(this._messages);
  }
}
