import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../core/GameScreen';
import { abilityForName } from '../../entities/units/abilities/abilityForName';
import { GlobalContext } from '../../core/GlobalContext';

const handleKeyCommand = async (command: KeyCommand, context: GlobalContext) => {
  const { state } = context;
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

export default {
  handleKeyCommand
} as ScreenInputHandler;