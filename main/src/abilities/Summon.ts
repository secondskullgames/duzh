import { Coordinates } from '@duzh/geometry';
import { checkNotNull } from '@duzh/utils/preconditions';
import { Game } from '@main/core/Game';
import { isBlocked } from '@main/maps/MapUtils';
import Unit from '@main/units/Unit';
import BasicEnemyController from '@main/units/controllers/BasicEnemyController';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class Summon implements UnitAbility {
  static readonly MANA_COST = 25;
  readonly name = AbilityName.SUMMON;
  manaCost = Summon.MANA_COST;
  readonly icon = null;
  readonly innate = false;

  isEnabled = (unit: Unit) =>
    unit.getMana() >= this.manaCost ||
    unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0;

  isLegal = (unit: Unit, coordinates: Coordinates) =>
    !isBlocked(coordinates, unit.getMap());

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { soundController, unitFactory } = game;
    const map = unit.getMap();
    const unitClass = checkNotNull(unit.getSummonedUnitClass());

    soundController.playSound('wizard_appear');

    const summonedUnit = await unitFactory.createUnit({
      modelId: unitClass,
      faction: unit.getFaction(),
      controller: new BasicEnemyController(),
      level: 1,
      coordinates,
      map
    });
    map.addUnit(summonedUnit);
    game.state.addUnit(summonedUnit);
    if (unit.getEffects().getDuration(StatusEffect.OVERDRIVE) === 0) {
      unit.spendMana(this.manaCost);
    }
  };
}
