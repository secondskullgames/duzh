import { dealDamage } from './dealDamage';
import { die } from './die';
import Unit from '../units/Unit';
import { Activity } from '../units/Activity';
import { Coordinates, Direction } from '@duzh/geometry';
import { sleep } from '@main/utils/promises';
import { isBlocked } from '@main/maps/MapUtils';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { Game } from '@main/core/Game';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s frostbolt hit ${target.getName()} for ${damageTaken} damage!`;
};

export const shootFrostbolt = async (
  unit: Unit,
  direction: Direction,
  damage: number,
  freezeDuration: number,
  game: Game
) => {
  const { soundController, ticker, state } = game;
  unit.setDirection(direction);

  const map = unit.getMap();
  const coordinatesList = [];
  let coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
  while (map.contains(coordinates) && !isBlocked(coordinates, map)) {
    coordinatesList.push(coordinates);
    coordinates = Coordinates.plusDirection(coordinates, direction);
  }

  const targetUnit = map.getUnit(coordinates);
  if (targetUnit) {
    soundController.playSound('player_hits_enemy');
    await playFrostboltAnimation(unit, direction, coordinatesList, targetUnit, game);
    const adjustedDamage = await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit
    });
    const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
    ticker.log(message, { turn: state.getTurn() });
    if (targetUnit.getLife() <= 0) {
      await sleep(100);
      await die(targetUnit, game);
    } else {
      targetUnit.setFrozen(freezeDuration);
      ticker.log(`${targetUnit.getName()} is frozen!`, { turn: state.getTurn() });
    }
  } else {
    await playFrostboltAnimation(unit, direction, coordinatesList, null, game);
  }
};

const playFrostboltAnimation = async (
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

  // frostbolt movement frames
  for (const coordinates of visibleCoordinatesList) {
    const projectile = await projectileFactory.createFrostbolt(
      coordinates,
      map,
      direction
    );
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
    target.getEffects().removeEffect(StatusEffect.DAMAGED);
    target.setActivity(Activity.STANDING, 1, target.getDirection());
  }
};
