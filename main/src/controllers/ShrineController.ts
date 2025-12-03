import { checkNotNull } from '@duzh/utils/preconditions';
import { randChoice, sample } from '@duzh/utils/random';
import { Game } from '@main/core/Game';
import { ShrineMenuState, ShrineOption } from '@main/core/state/ShrineMenuState';

export class ShrineController {
  prepareShrineMenu = (game: Game): ShrineMenuState => {
    const { state } = game;
    const options = [];
    const playerUnit = checkNotNull(state.getPlayerUnit());

    // grouped by key so we do not present redundant options for the same stat
    const possibleStatOptions: Record<string, ShrineOption[]> = {
      mana: [
        {
          label: '+5 Mana',
          onUse: async (game: Game) => {
            playerUnit.increaseMaxMana(5);
            // TODO
            game.soundController.playSound('use_potion');
          }
        }
      ],
      life: [
        {
          label: '+10 Life',
          onUse: async (game: Game) => {
            playerUnit.increaseMaxLife(10);
            // TODO
            game.soundController.playSound('use_potion');
          }
        }
      ],
      manaPerTurn: [
        {
          label: '+0.5 Mana Per Turn',
          onUse: async (game: Game) => {
            playerUnit.increaseManaPerTurn(0.5);
            // TODO
            game.soundController.playSound('use_potion');
          }
        }
      ],
      meleeDamage: [
        {
          label: '+1 Melee Damage',
          onUse: async (game: Game) => {
            playerUnit.increaseMeleeDamage(1);
            // TODO
            game.soundController.playSound('use_potion');
          }
        }
      ],
      missileDamage: [
        {
          label: '+2 Missile Damage',
          onUse: async (game: Game) => {
            playerUnit.increaseRangedDamage(2);
            // TODO
            game.soundController.playSound('use_potion');
          }
        }
      ]
    };

    const selectedOptions = sample(Object.values(possibleStatOptions), 3).map(options =>
      randChoice(options)
    );

    options.push(...selectedOptions);
    return new ShrineMenuState({
      options
    });
  };

  selectPreviousOption = (game: Game) => {
    const { state } = game;
    const shrineMenuState = checkNotNull(state.getShrineMenuState());
    shrineMenuState.selectPreviousOption();
  };

  selectNextOption = (game: Game) => {
    const { state } = game;
    const shrineMenuState = checkNotNull(state.getShrineMenuState());
    shrineMenuState.selectNextOption();
  };

  chooseSelectedOption = async (game: Game) => {
    const { state } = game;
    const shrineMenuState = checkNotNull(state.getShrineMenuState());
    const selectedOption = shrineMenuState.getSelectedOption();
    await selectedOption.onUse(game);
    state.setShrineMenuState(null);
  };
}
