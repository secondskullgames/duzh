import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen, Session } from '@main/core';
import { UnitAbility } from '@main/entities/units/abilities/UnitAbility';
import { inject, injectable } from 'inversify';

@injectable()
export default class HelpScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
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
        }
      }
    }
  };
}
