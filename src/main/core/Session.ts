import Game from './Game';
import GameDefinition from './GameDefinition';
import { GameScreen } from './GameScreen';

type Props = Readonly<{
  gameDefinition: GameDefinition
}>;

/**
 * Holder for "session-scoped" values.
 */
export default class Session {
  private readonly gameDefinition: GameDefinition;
  private game: Game | null;
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  
  constructor({ gameDefinition }: Props) {
    this.gameDefinition = gameDefinition;
    this.game = null;
    this.screen = GameScreen.NONE;
    this.prevScreen = null;
  }
  
  getGameDefinition = (): GameDefinition => {
    return this.gameDefinition;
  };

  setGame = (game: Game | null) => {
    this.game = game;
  };
  
  getGame = (): Game | null => {
    return this.game;
  };
  
  getScreen = (): GameScreen => this.screen;
  setScreen = (screen: GameScreen) => {
    this.prevScreen = this.screen;
    this.screen = screen;
  };

  /**
   * TODO: make this a stack
   */
  showPrevScreen = () => {
    if (this.prevScreen) {
      this.screen = this.prevScreen;
      this.prevScreen = null;
    } else {
      this.screen = GameScreen.GAME;
    }
  };
  
  reset = () => {
    this.screen = GameScreen.NONE;
    this.game = null;
  };
};