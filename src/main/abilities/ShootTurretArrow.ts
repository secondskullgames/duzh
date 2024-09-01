import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { getRangedDamage } from '@main/units/UnitUtils';
import { Activity } from '@main/units/Activity';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { dealDamage } from '@main/actions/dealDamage';
import { sleep } from '@lib/utils/promises';
import { die } from '@main/actions/die';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { StatusEffect } from '@main/units/effects/StatusEffect';

export class ShootTurretArrow implements UnitAbility {
  static readonly MANA_COST = 5;
  readonly name = AbilityName.SHOOT_TURRET_ARROW;
  readonly icon = null;
  manaCost = ShootTurretArrow.MANA_COST;
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = () => true; // TODO

  use = async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    unit.spendMana(this.manaCost);

    const coordinatesList = [];
    let targetCoordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    while (map.contains(targetCoordinates) && !isBlocked(targetCoordinates, map)) {
      coordinatesList.push(targetCoordinates);
      targetCoordinates = Coordinates.plusDirection(targetCoordinates, direction);
    }

    const targetUnit = map.getUnit(targetCoordinates);
    if (targetUnit) {
      const damage = getRangedDamage(unit);
      state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
      await this._playArrowAnimation(unit, direction, coordinatesList, targetUnit, state);
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = this._getDamageLogMessage(unit, targetUnit, adjustedDamage);
      session.getTicker().log(message, { turn: session.getTurn() });
      if (targetUnit.getLife() <= 0) {
        await sleep(100);
        await die(targetUnit, state, session);
      }
    } else {
      await this._playArrowAnimation(unit, direction, coordinatesList, null, state);
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
    state: GameState
  ) => {
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
      const projectile = await state
        .getProjectileFactory()
        .createArrow(coordinates, map, direction);
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
