import { tail } from '../utils/arrays';
import GameState from './GameState';

type Message = {
  message: string,
  turn: number
};

class Messages {
  readonly _messages: Message[] = [];

  pushMessage = (message: string) => {
    const turn = GameState.getInstance().getTurn();
    this._messages.push({ message, turn });
  };

  getAllMessages = () => this._messages.map(m => m.message);
  getRecentMessages = (maxCount: number): string[] => {
    const turn = GameState.getInstance().getTurn();
    return tail(
      this._messages.filter(m => m.turn >= turn - 3).map(m => m.message),
      maxCount
    );
  };
}

export default Messages;
