import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { getSpawner } from '@main/maps/MapUtils';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';
import { Game } from '@main/core/Game';
import { Attack, AttackResult } from '@main/controllers/UnitService';

export class PiercingAttack implements UnitAbility {
  static readonly MANA_COST = 0;
  static readonly DAMAGE_COEFFICIENT = 1;
  readonly name = AbilityName.PIERCE;
  manaCost = PiercingAttack.MANA_COST;
  readonly icon = 'icon1';
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return hasEnemyUnit(unit, coordinates);
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { unitService } = game;
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      const attack: Attack = {
        sound: Sounds.SPECIAL_ATTACK,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(
            getMeleeDamage(unit) * PiercingAttack.DAMAGE_COEFFICIENT
          );
          return { damage };
        },
        getDamageLogMessage: (
          attacker: Unit,
          defender: Unit,
          result: DefendResult
        ): string => {
          const attackerName = attacker.getName();
          const defenderName = defender.getName();
          const damage = result.damageTaken;
          return `${attackerName} hit ${defenderName} for ${damage} damage!`;
        }
      };
      await unitService.attackUnit(unit, targetUnit, attack, game);
    }

    const nextCoordinates = Coordinates.plusDirection(coordinates, unit.getDirection());
    const nextUnit = map.getUnit(nextCoordinates);
    if (nextUnit) {
      const attack: Attack = {
        sound: Sounds.SPECIAL_ATTACK,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(
            getMeleeDamage(unit) * PiercingAttack.DAMAGE_COEFFICIENT
          );
          return { damage };
        },
        getDamageLogMessage: (
          attacker: Unit,
          defender: Unit,
          result: DefendResult
        ): string => {
          const attackerName = attacker.getName();
          const defenderName = defender.getName();
          const damage = result.damageTaken;
          return `${attackerName} hit ${defenderName} for ${damage} damage!`;
        }
      };
      await unitService.attackUnit(unit, nextUnit, attack, game);
    }

    const spawner = getSpawner(map, coordinates);
    if (spawner && spawner.isBlocking()) {
      await unitService.attackObject(unit, spawner, game);
    }

    const nextSpawner = getSpawner(map, nextCoordinates);
    if (nextSpawner && nextSpawner.isBlocking()) {
      await unitService.attackObject(unit, nextSpawner, game);
    }
  };
}
