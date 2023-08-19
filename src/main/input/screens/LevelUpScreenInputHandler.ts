import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../core/GameScreen';
import { abilityForName } from '../../entities/units/abilities/abilityForName';

const handleKeyCommand = async (command: KeyCommand, { state }: ScreenHandlerContext) => {
  const playerUnit = state.getPlayerUnit();

  switch (command.key) {
    case 'L':
      state.showPrevScreen();
      break;
    case 'F1':
      state.setScreen(GameScreen.HELP);
      break;
    case 'UP':
      state.selectPreviousLevelUpScreenAbility();
      break;
    case 'DOWN':
      state.selectNextLevelUpScreenAbility();
      break;
    case 'ENTER': {
      const selectedAbility = state.getSelectedLevelUpScreenAbility();
      if (playerUnit.getAbilityPoints() > 0 && selectedAbility) {
        state.selectNextLevelUpScreenAbility();
        playerUnit.learnAbility(abilityForName(selectedAbility));
      }
    }
  }
};

const HelpScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default HelpScreenInputHandler;