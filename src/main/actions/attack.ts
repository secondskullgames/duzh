import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import { startAttack } from './startAttack';
import GameRenderer from '../graphics/renderers/GameRenderer';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import { dealDamage } from './dealDamage';
import { logMessage } from './logMessage';
import { die } from './die';
import { awardExperience } from './awardExperience';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  animationFactory: AnimationFactory
}>;

export const attack = async (
  attacker: Unit,
  defender: Unit,
  { state, renderer, animationFactory }: Props
) => {
  const playerUnit = state.getPlayerUnit();

  const damage = attacker.getDamage();
  playSound(Sounds.PLAYER_HITS_ENEMY);
  await startAttack(attacker, defender, {
    state,
    renderer,
    animationFactory
  });
  const adjustedDamage = await dealDamage(damage, {
    sourceUnit: attacker,
    targetUnit: defender
  });

  logMessage(
    `${attacker.getName()} hit ${defender.getName()} for ${adjustedDamage} damage!`,
    { state }
  );

  if (defender.getLife() <= 0) {
    await die(defender, { state });
    if (attacker === playerUnit) {
      awardExperience(attacker, 1);
    }
  }
};