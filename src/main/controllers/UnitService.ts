import Unit, { DefendResult } from '@main/units/Unit';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';
import { OrderExecutor } from '@main/units/orders/OrderExecutor';
import { Coordinates } from '@lib/geometry/Coordinates';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { getBonus } from '@main/maps/MapUtils';
import GameObject, { ObjectType } from '@main/objects/GameObject';
import Sounds from '@main/sounds/Sounds';
import { Activity } from '@main/units/Activity';
import { sleep } from '@lib/utils/promises';
import Spawner, { SpawnerState } from '@main/objects/Spawner';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { die } from '@main/actions/die';
import { recordKill } from '@main/actions/recordKill';
import { SoundEffect } from '@lib/audio/types';

export type AttackResult = Readonly<{
  /** the "outgoing", pre-mitigation damage */
  damage: number;
}>;

export type Attack = Readonly<{
  calculateAttackResult: (attacker: Unit) => AttackResult;
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult) => string;
  sound: SoundEffect;
}>;

/**
 * TODO I'm not naming this UnitController due to the unfortunate collision
 * with the other class of the same name.  Will change later.
 */
@injectable()
export class UnitService {
  constructor(
    @inject(OrderExecutor)
    private readonly orderExecutor: OrderExecutor
  ) {}

  playUnitTurnAction = async (unit: Unit, game: Game) => {
    await unit.upkeep(game);
    if (unit.getLife() <= 0) {
      return;
    }
    if (unit.canMove()) {
      const order = unit.getController().issueOrder(unit);
      await this.orderExecutor.executeOrder(unit, order, game);
    }
    await unit.endOfTurn(game);
  };

  /**
   * Move the specified unit to the specified coordinates on its current map,
   * including any relevant triggers.
   */
  moveUnit = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { state } = game;
    const map = unit.getMap();
    map.removeUnit(unit);

    unit.setCoordinates(coordinates);
    map.addUnit(unit);
    if (unit === state.getPlayerUnit()) {
      game.mapController.updateRevealedTiles(map, game);
    }

    for (const equipment of unit.getEquipment().getAll()) {
      if (equipment.script) {
        const nextCoordinates = Coordinates.plusDirection(
          unit.getCoordinates(),
          unit.getDirection()
        );
        await EquipmentScript.forName(equipment.script).afterMove?.(
          equipment,
          nextCoordinates,
          game
        );
      }
    }

    const bonus = getBonus(map, coordinates);
    if (bonus) {
      await bonus.onUse(unit, game);
    }
  };

  attackObject = async (unit: Unit, target: GameObject, game: Game) => {
    const { soundPlayer } = game;
    soundPlayer.playSound(Sounds.SPECIAL_ATTACK);
    unit.setActivity(Activity.ATTACKING, 1, unit.getDirection());
    await sleep(300);
    if (target.getObjectType() === ObjectType.SPAWNER) {
      const spawner = target as Spawner;
      spawner.setState(SpawnerState.DEAD);
    }
    unit.setActivity(Activity.STANDING, 1, unit.getDirection());
  };

  attackUnit = async (attacker: Unit, defender: Unit, attack: Attack, game: Game) => {
    const { soundPlayer, state, ticker } = game;
    for (const equipment of attacker.getEquipment().getAll()) {
      if (equipment.script) {
        await EquipmentScript.forName(equipment.script).beforeAttack?.(
          equipment,
          defender.getCoordinates(),
          game
        );
      }
    }

    // attacking frame
    attacker.setActivity(Activity.ATTACKING, 1, attacker.getDirection());

    await sleep(50);

    // damaged frame
    defender.getEffects().addEffect(StatusEffect.DAMAGED, 1);

    const attackResult = attack.calculateAttackResult(attacker);
    const defendResult = defender.takeDamage(attackResult.damage, attacker);
    attacker.recordDamageDealt(defendResult.damageTaken);
    soundPlayer.playSound(attack.sound);
    const message = attack.getDamageLogMessage(attacker, defender, defendResult);
    ticker.log(message, { turn: state.getTurn() });

    attacker.refreshCombat();
    defender.refreshCombat();

    if (defender.getLife() <= 0) {
      await die(defender, game);
      recordKill(attacker, defender, game);
    }

    for (const equipment of attacker.getEquipment().getAll()) {
      if (equipment.script) {
        await EquipmentScript.forName(equipment.script).afterAttack?.(
          equipment,
          defender.getCoordinates(),
          game
        );
      }
    }

    await sleep(150);

    attacker.setActivity(Activity.STANDING, 1, attacker.getDirection());
    defender.setActivity(Activity.STANDING, 1, defender.getDirection());
    defender.getEffects().removeEffect(StatusEffect.DAMAGED);
  };
}
