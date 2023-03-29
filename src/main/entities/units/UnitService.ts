import Coordinates from '../../geometry/Coordinates';
import GameState from '../../core/GameState';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import { EquipmentScript } from '../../equipment/EquipmentScript';
import Unit from './Unit';
import { checkNotNull } from '../../utils/preconditions';
import { UnitAbilities } from './abilities/UnitAbilities';
import { AbilityName } from './abilities/UnitAbility';
import AnimationFactory from '../../graphics/animations/AnimationFactory';
import { GameEngine } from '../../core/GameEngine';

const lifePerLevel = 0;
const manaPerLevel = 2;
const damagePerLevel = 0;

type Props = Readonly<{
  state: GameState,
  engine: GameEngine,
  animationFactory: AnimationFactory
}>;

export default class UnitService {
  private readonly state: GameState;
  private readonly engine: GameEngine;
  private readonly animationFactory: AnimationFactory;

  constructor({ state, engine, animationFactory }: Props) {
    this.state = state;
    this.engine = engine;
    this.animationFactory = animationFactory;
  }

  moveUnit = async (unit: Unit, coordinates: Coordinates) => {
    const { state } = this;
    const map = state.getMap();
    map.removeUnit(unit);

    unit.setCoordinates(coordinates);
    map.addUnit(unit);

    const playerUnit = state.getPlayerUnit();
    if (unit === playerUnit) {
      playSound(Sounds.FOOTSTEP);
    }

    for (const equipment of unit.getEquipment().getAll()) {
      if (equipment.script) {
        const nextCoordinates = Coordinates.plus(unit.getCoordinates(), unit.getDirection());
        await EquipmentScript.onMove(equipment, equipment.script, nextCoordinates);
      }
    }
  };

  awardExperience = (unit: Unit, experience: number) => {
    if (unit.getFaction() === 'PLAYER') {
      unit.gainExperience(experience);
      const experienceToNextLevel = unit.experienceToNextLevel();
      while (experienceToNextLevel && unit.getExperience() >= experienceToNextLevel) {
        this.levelUp(unit);
        unit.gainExperience(-experienceToNextLevel);
        playSound(Sounds.LEVEL_UP);
      }
    }
  };

  levelUp = (unit: Unit) => {
    unit.incrementLevel();
    unit.incrementMaxLife(lifePerLevel);
    unit.incrementMaxMana(manaPerLevel);
    unit.incrementDamage(damagePerLevel);
    const abilities = unit.getNewAbilities(unit.getLevel());
    for (const abilityName of abilities) {
      const ability = UnitAbilities.abilityForName(abilityName as AbilityName);
      unit.addAbility(ability);
    }
  };

  startAttack = async (unit: Unit, target: Unit) => {
    const animation = this.animationFactory.getAttackingAnimation(unit, target);
    await this.engine.playAnimation(animation);

    for (const equipment of unit.getEquipment().getAll()) {
      if (equipment.script) {
        await EquipmentScript.onAttack(equipment, equipment.script, target.getCoordinates());
      }
    }

    unit.refreshCombat();
  };

  static INSTANCE: UnitService | null = null;
  static setInstance = (instance: UnitService) => { UnitService.INSTANCE = instance; };
  /**
   * @deprecated
   */
  static getInstance = (): UnitService => checkNotNull(UnitService.INSTANCE);
}