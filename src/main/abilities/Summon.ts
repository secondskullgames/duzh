import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import BasicEnemyController from '@main/units/controllers/BasicEnemyController';
import { Coordinates } from '@lib/geometry/Coordinates';
import { checkNotNull } from '@lib/utils/preconditions';
import { isBlocked } from '@main/maps/MapUtils';
import { Game } from '@main/core/Game';

export class Summon implements UnitAbility {
  static readonly MANA_COST = 25;
  readonly name = AbilityName.SUMMON;
  manaCost = Summon.MANA_COST;
  readonly icon = null;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) =>
    !isBlocked(coordinates, unit.getMap());

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { soundPlayer, unitFactory } = game;
    const map = unit.getMap();
    const unitClass = checkNotNull(unit.getSummonedUnitClass());

    soundPlayer.playSound(Sounds.WIZARD_APPEAR);

    const summonedUnit = await unitFactory.createUnit({
      unitClass,
      faction: unit.getFaction(),
      controller: new BasicEnemyController(),
      level: 1,
      coordinates,
      map
    });
    map.addUnit(summonedUnit);
    unit.spendMana(this.manaCost);
  };
}
