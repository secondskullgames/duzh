import Equipment from './Equipment';
import { GameState } from '@main/core/GameState';
import { checkNotNull } from '@main/utils/preconditions';
import { ShootBolt } from '@main/entities/units/abilities/ShootBolt';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';
import { Coordinates } from '@main/geometry';

export type EquipmentScriptName = 'bolt_sword' | 'bow_of_frost';

export type EquipmentScript = Readonly<{
  beforeAttack?: (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => Promise<void>;

  afterAttack?: (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => Promise<void>;

  afterRangedAttack?: (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => Promise<void>;

  onMove?: (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => Promise<void>;
}>;

const BoltSwordScript: EquipmentScript = {
  onMove: async (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => {
    const map = session.getMap();
    const unit = checkNotNull(equipment.getUnit());

    const direction = unit.getDirection();
    let coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    while (map.contains(coordinates) && !isBlocked(map, coordinates)) {
      coordinates = Coordinates.plus(coordinates, direction);
    }

    if (
      map.contains(coordinates) &&
      map.isTileRevealed(coordinates) &&
      map.getUnit(coordinates)
    ) {
      await ShootBolt.use(unit, target, session, state);
    }
  }
};

const BowOfFrostScript: EquipmentScript = {
  afterRangedAttack: async (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => {
    const unit = checkNotNull(equipment.getUnit());
    const map = unit.getMap();
    const targetUnit = map.getUnit(target);
    if (targetUnit) {
      targetUnit.setFrozen(5);
      session
        .getTicker()
        .log(`${targetUnit.getName()} is frozen!`, { turn: session.getTurn() });
    }
  }
};

export namespace EquipmentScript {
  export const forName = (name: EquipmentScriptName): EquipmentScript => {
    switch (name) {
      case 'bolt_sword':
        return BoltSwordScript;
      case 'bow_of_frost':
        return BowOfFrostScript;
      default:
        throw new Error(`Unknown equipment script ${name}`);
    }
  };
}
