import { tail } from '../utils/arrays';
import GameState from './GameState';

const maxTurnsAgo = 8;
const maxMessages = 4;

type Message = Readonly<{
  message: string,
  turn: number
}>;

export default class Messages {
  private readonly _messages: Message[] = [];

  log = (message: string) => {
    const turn = GameState.getInstance().getTurn();
    this._messages.push({ message, turn });
  };

  getAllMessages = () => this._messages.map(m => m.message);
  getRecentMessages = (): string[] => {
    const turn = GameState.getInstance().getTurn();
    return tail(
      this._messages.filter(m => m.turn >= turn - maxTurnsAgo).map(m => m.message),
      maxMessages
    );
  };
}
