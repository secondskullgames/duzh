import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import MapFactory from '../../maps/MapFactory';
import { showSplashScreen } from '@main/actions/showSplashScreen';
import { toggleFullScreen } from '@main/utils/dom';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { GameConfig } from '@main/core/GameConfig';
import { inject, injectable } from 'inversify';

@injectable()
export default class VictoryScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(GameConfig)
    private readonly gameConfig: GameConfig,
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState,
    @inject(MapFactory)
    private readonly mapFactory: MapFactory
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
    const { state, session } = this;
    const { key, modifiers } = command;
    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await showSplashScreen(state, session);
          state.reset();
          session.reset();
          const maps = await this.mapFactory.loadMapSuppliers(this.gameConfig.mapSpecs);
          state.addMaps(maps);
        }
        break;
      case 'ESCAPE':
        session.setScreen(GameScreen.GAME);
    }
  };
}
