import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { Activity } from '@main/units/Activity';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { dealDamage } from '@main/actions/dealDamage';
import { sleep } from '@lib/utils/promises';
import { die } from '@main/actions/die';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { Game } from '@main/core/Game';

export class ShootBolt implements UnitAbility {
  static readonly MANA_COST = 0;
  readonly name = AbilityName.BOLT;
  readonly icon = null;
  manaCost = ShootBolt.MANA_COST;
  readonly innate = false;

  isEnabled = () => true;

  isLegal = () => true; // TODO

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { state, session } = game;
    const map = session.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    // unit.spendMana(0); // TODO

    const coordinatesList = [];
    let nextCoordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    while (map.contains(nextCoordinates) && !isBlocked(nextCoordinates, map)) {
      coordinatesList.push(nextCoordinates);
      nextCoordinates = Coordinates.plusDirection(nextCoordinates, direction);
    }

    const targetUnit = map.getUnit(nextCoordinates);
    if (targetUnit) {
      const damage = getMeleeDamage(unit);
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = this._getDamageLogMessage(unit, targetUnit, adjustedDamage);
      await this._playBoltAnimation(unit, direction, coordinatesList, targetUnit, state);
      state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
      session.getTicker().log(message, { turn: session.getTurn() });
      if (targetUnit.getLife() <= 0) {
        await sleep(100);
        await die(targetUnit, game);
      }
    } else {
      await this._playBoltAnimation(unit, direction, coordinatesList, null, state);
    }
  };

  private _getDamageLogMessage = (
    unit: Unit,
    target: Unit,
    damageTaken: number
  ): string => {
    return `${unit.getName()}'s bolt hit ${target.getName()} for ${damageTaken} damage!`;
  };

  private _playBoltAnimation = async (
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
