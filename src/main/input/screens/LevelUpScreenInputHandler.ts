import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../core/GameScreen';
import { abilityForName } from '../../entities/units/abilities/abilityForName';
import { Session } from '../../core/Session';

const HelpScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand: async (command: KeyCommand, session: Session) => {
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
  }
};

export default HelpScreenInputHandler;
