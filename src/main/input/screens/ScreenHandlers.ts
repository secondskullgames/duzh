import { ScreenInputHandler } from './ScreenInputHandler';
import CharacterScreenInputHandler from './CharacterScreenInputHandler';
import GameScreenInputHandler from './GameScreenInputHandler';
import GameOverScreenInputHandler from './GameOverScreenInputHandler';
import HelpScreenInputHandler from './HelpScreenInputHandler';
import InventoryScreenInputHandler from './InventoryScreenInputHandler';
import MapScreenInputHandler from './MapScreenInputHandler';
import TitleScreenInputHandler from './TitleScreenInputHandler';
import VictoryScreenInputHandler from './VictoryScreenInputHandler';
import { GameScreen } from '@main/core/GameScreen';
import { injectable } from 'inversify';

@injectable()
export default class ScreenHandlers {
  private readonly screenHandlers: Record<GameScreen, ScreenInputHandler>;

  constructor(
    characterScreenInputHandler: CharacterScreenInputHandler,
    gameScreenInputHandler: GameScreenInputHandler,
    gameOverScreenInputHandler: GameOverScreenInputHandler,
    helpScreenInputHandler: HelpScreenInputHandler,
    inventoryInputHandler: InventoryScreenInputHandler,
    mapScreenInputHandler: MapScreenInputHandler,
    titleScreenInputHandler: TitleScreenInputHandler,
    victoryScreenInputHandler: VictoryScreenInputHandler
  ) {
    this.screenHandlers = {
      [GameScreen.NONE]: {
        handleKeyDown: async () => {},
        handleKeyUp: async () => {}
      },
      [GameScreen.CHARACTER]: characterScreenInputHandler,
      [GameScreen.GAME]: gameScreenInputHandler,
      [GameScreen.GAME_OVER]: gameOverScreenInputHandler,
      [GameScreen.HELP]: helpScreenInputHandler,
      [GameScreen.INVENTORY]: inventoryInputHandler,
      [GameScreen.MAP]: mapScreenInputHandler,
      [GameScreen.TITLE]: titleScreenInputHandler,
      [GameScreen.VICTORY]: victoryScreenInputHandler
    };
  }

  getHandler = (screen: GameScreen): ScreenInputHandler => {
    return this.screenHandlers[screen];
  };
}
