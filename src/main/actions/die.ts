import Unit from '../entities/units/Unit';
import { gameOver } from './gameOver';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import { logMessage } from './logMessage';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState
}>;

export const die = async (unit: Unit, { state }: Props) => {
  const map = state.getMap();
  const playerUnit = state.getPlayerUnit();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver({ state });
    return;
  } else {
    playSound(Sounds.ENEMY_DIES);
    logMessage(`${unit.getName()} dies!`, { state });
  }
};