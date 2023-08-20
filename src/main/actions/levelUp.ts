import Unit from '../entities/units/Unit';
import { Faction } from '../types/types';
import Game from '../core/Game';
import { Feature } from '../utils/features';
import { abilityForName } from '../entities/units/abilities/abilityForName';
import { AbilityName } from '../entities/units/abilities/AbilityName';
import Ticker from '../core/Ticker';

const lifePerLevel = 0;
const manaPerLevel = 2;
const strengthPerLevel = 1;

type Context = Readonly<{
  game: Game,
  ticker: Ticker
}>;

export const levelUp = (unit: Unit, { game, ticker }: Context) => {
  unit.incrementLevel();
  // TODO - maybe these should go in player.json (again?)
  if (unit.getFaction() === Faction.PLAYER) {
    unit.increaseMaxLife(lifePerLevel);
    unit.increaseMaxMana(manaPerLevel);
    unit.increaseStrength(strengthPerLevel);

    if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      ticker.log(`Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`, { turn: game.getTurn() });
      unit.awardAbilityPoint();
    } else {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: game.getTurn() });
      switch (unit.getLevel()) {
        case 2:
          unit.learnAbility(abilityForName(AbilityName.HEAVY_ATTACK));
          break;
        case 3:
          unit.learnAbility(abilityForName(AbilityName.KNOCKBACK_ATTACK));
          break;
        case 4:
          unit.learnAbility(abilityForName(AbilityName.STUN_ATTACK));
          break;
        case 5:
          unit.learnAbility(abilityForName(AbilityName.BLINK));
          break;
      }
    }
  }
};