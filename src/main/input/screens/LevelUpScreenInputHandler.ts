import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../core/GameScreen';
import { abilityForName } from '../../entities/units/abilities/abilityForName';

const handleKeyCommand = async (command: KeyCommand, { game, session, imageFactory }: ScreenHandlerContext) => {
  const playerUnit = game.getPlayerUnit();

  switch (command.key) {
    case 'L':
      session.showPrevScreen();
      break;
    case 'F1':
      session.setScreen(GameScreen.HELP);
      break;
    case 'UP':
      game.selectPreviousLevelUpScreenAbility();
      break;
    case 'DOWN':
      game.selectNextLevelUpScreenAbility();
      break;
    case 'ENTER': {
      const selectedAbility = game.getSelectedLevelUpScreenAbility();
      if (playerUnit.getAbilityPoints() > 0 && selectedAbility) {
        game.selectNextLevelUpScreenAbility();
        playerUnit.learnAbility(abilityForName(selectedAbility));
      }
    }
  }
};

const HelpScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default HelpScreenInputHandler;