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
import { playAnimation } from '../../graphics/animations/playAnimation';
import GameRenderer from '../../graphics/renderers/GameRenderer';

const lifePerLevel = 0;
const manaPerLevel = 2;
const damagePerLevel = 0;

type Props = Readonly<{
  state: GameState,
  animationFactory: AnimationFactory
}>;

export default class UnitService {
  private readonly state: GameState;
  private readonly animationFactory: AnimationFactory;

  constructor({ state, animationFactory }: Props) {
    this.state = state;
    this.animationFactory = animationFactory;
  }

  /** @return the amount of adjusted damage taken */
  dealDamage = async (baseDamage: number, params: DealDamageParams): Promise<number> => {
    const sourceUnit = params.sourceUnit ?? null;
    const targetUnit = params.targetUnit;
    const adjustedDamage = targetUnit.takeDamage(baseDamage, sourceUnit);
    sourceUnit?.refreshCombat();
    targetUnit.refreshCombat();
    return adjustedDamage;
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
    await playAnimation(animation, {
      state: this.state,
      renderer: GameRenderer.getInstance()
    });

    for (const equipment of unit.getEquipment().getAll()) {
      if (equipment.script) {
        await EquipmentScript.onAttack(equipment, equipment.script, target.getCoordinates());
      }
    }

    unit.refreshCombat();
  };

  private static INSTANCE: UnitService | null = null;
  static setInstance = (instance: UnitService) => { UnitService.INSTANCE = instance; };
  /**
   * @deprecated
   */
  static getInstance = (): UnitService => checkNotNull(UnitService.INSTANCE);
}

type DealDamageParams = Readonly<{
  sourceUnit?: Unit,
  targetUnit: Unit
}>;