import { tail } from '../utils/arrays';
import GameState from './GameState';

const maxTurnsAgo = 6;
const maxMessages = 3;

type Message = {
  message: string,
  turn: number
};

class Messages {
  readonly _messages: Message[] = [];

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

export default Messages;
