import Unit from '../units/Unit';
import GameState from './GameState';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import { gameOver } from './actions';

export const attack = async (source: Unit, target: Unit, damage?: number) => {
  if (damage === undefined) {
    damage = source.getDamage();
  }

  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();

  await source.startAttack(target);
  const damageTaken = await target.takeDamage(damage, source);

  if (source) {
    state.logMessage(`${source.getName()} hit ${target.getName()} for ${damageTaken} damage!`);
  }

  if (target.getLife() <= 0) {
    map.removeUnit(target.getCoordinates());
    if (target === playerUnit) {
      await gameOver();
      return;
    } else {
      playSound(Sounds.ENEMY_DIES);
      state.logMessage(`${target.getName()} dies!`);
    }

    if (source === playerUnit) {
      source.gainExperience(1);
    }
  }
};