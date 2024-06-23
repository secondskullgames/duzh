import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '@lib/input/inputTypes';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Feature } from '@main/utils/features';
import { AbilityName } from '@main/abilities/AbilityName';
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
        const selectedAbilityName = levelUpState.getSelectedAbility();
        if (playerUnit.getAbilityPoints() > 0 && selectedAbilityName) {
          levelUpState.selectNextAbility(playerUnit);
          // TODO - centralize this logic, it's copy-pasted
          playerUnit.learnAbility(UnitAbility.abilityForName(selectedAbilityName));
          if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
            playerUnit.spendAbilityPoint();
          }
          session
            .getTicker()
            .log(`Learned ${AbilityName.localize(selectedAbilityName)}.`, {
              turn: session.getTurn()
            });
        }
      }
    }
  };

  handleKeyUp = async () => {};
}
