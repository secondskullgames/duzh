import Unit from '../entities/units/Unit';
import { levelUp } from './levelUp';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Game from '../core/Game';
import Ticker from '../core/Ticker';

type Context = Readonly<{
  game: Game,
  ticker: Ticker
}>;

/**
 * @param unit the unit who performed the kill
 */
export const recordKill = (unit: Unit, { game, ticker }: Context) => {
  unit.recordKill();
  const killsToNextLevel = unit.getKillsToNextLevel();
  if (killsToNextLevel !== null) {
    if (unit.getLifetimeKills() >= killsToNextLevel) {
      levelUp(unit, { ticker, game: game });
      playSound(Sounds.LEVEL_UP);
    }
  }
};