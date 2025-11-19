import { ShrineMenuState, ShrineOption } from '@main/core/state/ShrineMenuState';
import { Game } from '@main/core/Game';
import { checkNotNull } from '@lib/utils/preconditions';
import Sounds from '@main/sounds/Sounds';
import { randChoice, sample } from '@lib/utils/random';

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
            game.soundPlayer.playSound(Sounds.USE_POTION);
          }
        }
      ],
      life: [
        {
          label: '+10 Life',
          onUse: async (game: Game) => {
            playerUnit.increaseMaxLife(10);
            // TODO
            game.soundPlayer.playSound(Sounds.USE_POTION);
          }
        }
      ],
      lifePerTurn: [
        {
          label: '+0.5 Life Per Turn',
          onUse: async (game: Game) => {
            playerUnit.increaseLifePerTurn(0.5);
            // TODO
            game.soundPlayer.playSound(Sounds.USE_POTION);
          }
        }
      ],
      manaPerTurn: [
        {
          label: '+0.5 Mana Per Turn',
          onUse: async (game: Game) => {
            playerUnit.increaseManaPerTurn(0.5);
            // TODO
            game.soundPlayer.playSound(Sounds.USE_POTION);
          }
        }
      ],
      meleeDamage: [
        {
          label: '+1 Melee Damage',
          onUse: async (game: Game) => {
            playerUnit.increaseMeleeDamage(1);
            // TODO
            game.soundPlayer.playSound(Sounds.USE_POTION);
          }
        }
      ],
      missileDamage: [
        {
          label: '+2 Missile Damage',
          onUse: async (game: Game) => {
            playerUnit.increaseRangedDamage(2);
            // TODO
            game.soundPlayer.playSound(Sounds.USE_POTION);
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
}
