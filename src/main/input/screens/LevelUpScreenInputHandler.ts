import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../core/GameScreen';
import { abilityForName } from '../../entities/units/abilities/abilityForName';

const handleKeyCommand = async (
  command: KeyCommand,
  { session }: ScreenHandlerContext
) => {
  const playerUnit = session.getPlayerUnit();
  const levelUpState = session.getLevelUpScreen();

  switch (command.key) {
    case 'L':
      session.showPrevScreen();
      break;
    case 'F1':
      session.setScreen(GameScreen.HELP);
      break;
    case 'UP':
      levelUpState.selectPreviousAbility(playerUnit);
      break;
    case 'DOWN':
      levelUpState.selectNextAbility(playerUnit);
      break;
    case 'ENTER': {
      const selectedAbility = levelUpState.getSelectedAbility();
      if (playerUnit.getAbilityPoints() > 0 && selectedAbility) {
        levelUpState.selectNextAbility(playerUnit);
        playerUnit.learnAbility(abilityForName(selectedAbility));
      }
    }
  }
};

const HelpScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default HelpScreenInputHandler;
