import { Coordinates, Direction, pointAt } from '@duzh/geometry';
import { EquipmentSlot } from '@duzh/models';
import { dealDamage } from '@main/actions/dealDamage';
import { die } from '@main/actions/die';
import { Game } from '@main/core/Game';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { isBlocked } from '@main/maps/MapUtils';
import { Activity } from '@main/units/Activity';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit from '@main/units/Unit';
import { getRangedDamage } from '@main/units/UnitUtils';
import { sleep } from '@main/utils/promises';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

export class ShootArrow implements UnitAbility {
  static readonly MANA_COST = 5;
  readonly name = AbilityName.SHOOT_ARROW;
  readonly icon = 'harpoon_icon';
  manaCost = ShootArrow.MANA_COST;
  readonly innate = true;

  isEnabled = (unit: Unit) =>
    unit.getEquipment().getBySlot(EquipmentSlot.RANGED_WEAPON) !== null &&
    (unit.getMana() >= this.manaCost ||
      unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0);

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return true;
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { soundController, state, ticker } = game;
    if (!unit.getEquipment().getBySlot(EquipmentSlot.RANGED_WEAPON)) {
      throw new Error('ShootArrow requires a ranged weapon!');
    }

    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (unit.getEffects().getDuration(StatusEffect.OVERDRIVE) === 0) {
      unit.spendMana(this.manaCost);
    }

    const coordinatesList = [];
    let targetCoordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    while (map.contains(targetCoordinates) && !isBlocked(targetCoordinates, map)) {
      coordinatesList.push(targetCoordinates);
      targetCoordinates = Coordinates.plusDirection(targetCoordinates, direction);
    }

    const targetUnit = map.getUnit(targetCoordinates);
    if (targetUnit) {
      const damage = getRangedDamage(unit);
      await this._playArrowAnimation(unit, direction, coordinatesList, targetUnit, game);
      soundController.playSound('player_hits_enemy');
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = this._getDamageLogMessage(unit, targetUnit, adjustedDamage);
      ticker.log(message, { turn: state.getTurn() });
      if (targetUnit.getLife() <= 0) {
        await sleep(100);
        await die(targetUnit, game);
      } else {
        for (const equipment of unit.getEquipment().getAll()) {
          if (equipment.script) {
            await EquipmentScript.forName(equipment.script).afterRangedAttack?.(
              equipment,
              targetUnit.getCoordinates(),
              game
            );
          }
        }
      }
    } else {
      await this._playArrowAnimation(unit, direction, coordinatesList, null, game);
    }
  };

  private _getDamageLogMessage = (
    unit: Unit,
    target: Unit,
    damageTaken: number
  ): string => {
    return `${unit.getName()}'s arrow hit ${target.getName()} for ${damageTaken} damage!`;
  };

  private _playArrowAnimation = async (
    source: Unit,
    direction: Direction,
    coordinatesList: Coordinates[],
    target: Unit | null,
    game: Game
  ) => {
    const { projectileFactory } = game;
    const map = source.getMap();

    // first frame
    source.setActivity(Activity.SHOOTING, 1, source.getDirection());
    if (target) {
      target.setActivity(Activity.STANDING, 1, target.getDirection());
    }
    await sleep(100);

    const visibleCoordinatesList = coordinatesList.filter(coordinates =>
      map.isTileRevealed(coordinates)
    );

    // arrow movement frames
    for (const coordinates of visibleCoordinatesList) {
      const projectile = await projectileFactory.createArrow(coordinates, map, direction);
      map.addProjectile(projectile);
      await sleep(50);
      map.removeProjectile(projectile);
    }

    // last frames
    if (target) {
      target.getEffects().addEffect(StatusEffect.DAMAGED, 1);
      await sleep(100);
    }
    source.setActivity(Activity.STANDING, 1, source.getDirection());
    if (target) {
      target.setActivity(Activity.STANDING, 1, target.getDirection());
      target.getEffects().removeEffect(StatusEffect.DAMAGED);
    }
  };
}
