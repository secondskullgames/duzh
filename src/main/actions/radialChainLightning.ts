import { recordKill } from './recordKill';
import { die } from './die';
import { dealDamage } from './dealDamage';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Activity } from '../units/Activity';
import { Coordinates } from '@lib/geometry/Coordinates';
import { sleep } from '@lib/utils/promises';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import MapInstance from '@main/maps/MapInstance';
import { Direction } from '@lib/geometry/Direction';
import { Faction } from '@main/units/Faction';
import { Globals } from '@main/core/globals';

const getAdjacentEnemies = (unit: Unit, map: MapInstance) => {
  return map
    .getAllUnits()
    .filter(u => u.getFaction() === Faction.ENEMY)
    .filter(u => {
      const { dx, dy } = Coordinates.difference(
        unit.getCoordinates(),
        u.getCoordinates()
      );
      const direction = Direction.fromOffsetsOptional({ dx, dy });
      return direction !== null;
    });
};

export const radialChainLightning = async (unit: Unit, damage: number) => {
  const { session, soundPlayer } = Globals;
  const map = unit.getMap();
  const alreadyDamagedEnemies: Unit[] = [];
  const queue: Unit[] = getAdjacentEnemies(unit, map);

  while (true) {
    const targetUnit = queue.shift();
    if (!targetUnit) {
      break;
    }
    const adjacentTargets: Unit[] = getAdjacentEnemies(targetUnit, map)
      .filter(u => !queue.includes(u))
      .filter(u => !alreadyDamagedEnemies.includes(u));
    queue.push(...adjacentTargets);
    targetUnit.getEffects().addEffect(StatusEffect.DAMAGED, 1);
    targetUnit.getEffects().addEffect(StatusEffect.SHOCKED, 1);
    const damageTaken = await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit: targetUnit
    });

    const message = getDamageLogMessage(unit, targetUnit, damageTaken);
    session.getTicker().log(message, { turn: session.getTurn() });
    if (targetUnit.getLife() <= 0) {
      await die(targetUnit);
      recordKill(unit, targetUnit);
    }
    await sleep(150);
    soundPlayer.playSound(Sounds.PLAYER_HITS_ENEMY);

    unit.setActivity(Activity.STANDING, 1, unit.getDirection());
    targetUnit.setActivity(Activity.STANDING, 1, unit.getDirection());
    targetUnit.getEffects().removeEffect(StatusEffect.DAMAGED);
    targetUnit.getEffects().removeEffect(StatusEffect.SHOCKED);
    alreadyDamagedEnemies.push(targetUnit);
  }
};

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s chain lightning hit ${target.getName()} for ${damageTaken} damage!`;
};
