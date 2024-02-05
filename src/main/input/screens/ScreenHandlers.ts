import { ScreenInputHandler } from './ScreenInputHandler';
import CharacterScreenInputHandler from './CharacterScreenInputHandler';
import GameScreenInputHandler from './GameScreenInputHandler';
import GameOverScreenInputHandler from './GameOverScreenInputHandler';
import HelpScreenInputHandler from './HelpScreenInputHandler';
import InventoryV2InputHandler from './InventoryV2InputHandler';
import LevelUpScreenInputHandler from './LevelUpScreenInputHandler';
import MapScreenInputHandler from './MapScreenInputHandler';
import TitleScreenInputHandler from './TitleScreenInputHandler';
import VictoryScreenInputHandler from './VictoryScreenInputHandler';
import { GameScreen } from '../../core/GameScreen';
import { injectable } from 'inversify';

@injectable()
export default class ScreenHandlers {
  private readonly screenHandlers: Record<GameScreen, ScreenInputHandler>;

  constructor(
    characterScreenInputHandler: CharacterScreenInputHandler,
    gameScreenInputHandler: GameScreenInputHandler,
    gameOverScreenInputHandler: GameOverScreenInputHandler,
    inventoryInputHandler: InventoryV2InputHandler,
    levelUpScreenInputHandler: LevelUpScreenInputHandler,
    titleScreenInputHandler: TitleScreenInputHandler,
    victoryScreenInputHandler: VictoryScreenInputHandler
  ) {
    this.screenHandlers = {
      [GameScreen.NONE]: { handleKeyCommand: async () => {} },
      [GameScreen.CHARACTER]: characterScreenInputHandler,
      [GameScreen.GAME]: gameScreenInputHandler,
      [GameScreen.GAME_OVER]: gameOverScreenInputHandler,
      [GameScreen.HELP]: HelpScreenInputHandler,
      [GameScreen.INVENTORY]: inventoryInputHandler,
      [GameScreen.LEVEL_UP]: levelUpScreenInputHandler,
      [GameScreen.MAP]: MapScreenInputHandler,
      [GameScreen.TITLE]: titleScreenInputHandler,
      [GameScreen.VICTORY]: victoryScreenInputHandler
    };
  }

  getHandler = (screen: GameScreen): ScreenInputHandler => {
    return this.screenHandlers[screen] as ScreenInputHandler;
  };
}
