import { clear, tail } from '@lib/utils/arrays';
import { GameState } from '@main/core/GameState';

const maxTurnsAgo = 8;
const maxMessages = 2;

type Message = Readonly<{
  message: string;
  turn: number;
}>;

export default class Ticker {
  private readonly messages: Message[] = [];

  log = (message: string, state: GameState) => {
    this.messages.push({ message, turn: state.getTurn() });
  };

  getAllMessages = () => this.messages.map(m => m.message);
  getRecentMessages = (state: GameState): string[] => {
    return tail(
      this.messages
        .filter(m => m.turn >= state.getTurn() - maxTurnsAgo)
        .map(m => m.message),
      maxMessages
    );
  };

  clear = () => {
    clear(this.messages);
  };
}
