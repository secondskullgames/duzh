import { ScreenInputHandler } from './ScreenInputHandler';
import CharacterScreenInputHandler from './CharacterScreenInputHandler';
import GameScreenInputHandler from './GameScreenInputHandler';
import GameOverScreenInputHandler from './GameOverScreenInputHandler';
import HelpScreenInputHandler from './HelpScreenInputHandler';
import InventoryV2InputHandler from './InventoryV2InputHandler';
import InventoryScreenInputHandler from './InventoryScreenInputHandler';
import LevelUpScreenInputHandler from './LevelUpScreenInputHandler';
import MapScreenInputHandler from './MapScreenInputHandler';
import TitleScreenInputHandler from './TitleScreenInputHandler';
import VictoryScreenInputHandler from './VictoryScreenInputHandler';
import { Feature } from '../../utils/features';
import { GameScreen } from '../../core/GameScreen';
import { injectable } from 'inversify';

@injectable()
export default class ScreenHandlers {
  private readonly screenHandlers: Record<GameScreen, ScreenInputHandler>;

  constructor(
    gameOverScreenInputHandler: GameOverScreenInputHandler,
    titleScreenInputHandler: TitleScreenInputHandler,
    victoryScreenInputHandler: VictoryScreenInputHandler
  ) {
    this.screenHandlers = {
      [GameScreen.NONE]: { handleKeyCommand: async () => {} },
      [GameScreen.CHARACTER]: CharacterScreenInputHandler,
      [GameScreen.GAME]: GameScreenInputHandler,
      [GameScreen.GAME_OVER]: gameOverScreenInputHandler,
      [GameScreen.HELP]: HelpScreenInputHandler,
      [GameScreen.INVENTORY]: Feature.isEnabled(Feature.INVENTORY_V2)
        ? InventoryV2InputHandler
        : InventoryScreenInputHandler,
      [GameScreen.LEVEL_UP]: LevelUpScreenInputHandler,
      [GameScreen.MAP]: MapScreenInputHandler,
      [GameScreen.TITLE]: titleScreenInputHandler,
      [GameScreen.VICTORY]: victoryScreenInputHandler
    };
  }

  getHandler = (screen: GameScreen): ScreenInputHandler => {
    return this.screenHandlers[screen] as ScreenInputHandler;
  };
}
