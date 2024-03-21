import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '@lib/input/inputTypes';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Feature } from '@main/utils/features';
import { inject, injectable } from 'inversify';

@injectable()
export default class HelpScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session)
    private readonly session: Session
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { session } = this;
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
          playerUnit.learnAbility(UnitAbility.abilityForName(selectedAbility));
          if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
            playerUnit.spendAbilityPoint();
          }
        }
      }
    }
  };

  handleKeyUp = async () => {};
}
