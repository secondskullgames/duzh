import Unit from '../entities/units/Unit';
import { levelUp } from './levelUp';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';

export const awardExperience = (unit: Unit, experience: number) => {
  if (unit.getFaction() === 'PLAYER') {
    unit.gainExperience(experience);
    const experienceToNextLevel = unit.experienceToNextLevel();
    while (experienceToNextLevel && unit.getExperience() >= experienceToNextLevel) {
      levelUp(unit);
      unit.gainExperience(-experienceToNextLevel);
      playSound(Sounds.LEVEL_UP);
    }
  }
};