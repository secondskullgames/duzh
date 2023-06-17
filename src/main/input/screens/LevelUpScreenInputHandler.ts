import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../core/GameScreen';
import { abilityForName } from '../../entities/units/abilities/abilityForName';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerContext) => {
  const playerUnit = state.getPlayerUnit();

  switch (command.key) {
    case 'L':
      state.showPrevScreen();
      await renderer.render();
      break;
    case 'F1':
      state.setScreen(GameScreen.HELP);
      await renderer.render();
      break;
    case 'UP':
      state.selectPreviousLevelUpScreenAbility();
      await renderer.render();
      break;
    case 'DOWN':
      state.selectNextLevelUpScreenAbility();
      await renderer.render();
      break;
    case 'ENTER': {
      const selectedAbility = state.getSelectedLevelUpScreenAbility();
      if (playerUnit.getAbilityPoints() > 0 && selectedAbility) {
        state.selectNextLevelUpScreenAbility();
        playerUnit.learnAbility(abilityForName(selectedAbility));
      }
      await renderer.render();
    }
  }
};

const HelpScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default HelpScreenInputHandler;