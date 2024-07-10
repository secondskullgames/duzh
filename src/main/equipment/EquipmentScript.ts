import Equipment from './Equipment';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { checkNotNull } from '@lib/utils/preconditions';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';
import { AbilityName } from '@main/abilities/AbilityName';

export type EquipmentScriptName =
  | 'bolt_sword'
  | 'bow_of_fire'
  | 'bow_of_frost'
  | 'fire_sword';

type EquipmentProc = (
  equipment: Equipment,
  target: Coordinates,
  state: GameState,
  session: Session
) => Promise<void>;

export type EquipmentScript = Readonly<{
  beforeAttack?: EquipmentProc;
  afterAttack?: EquipmentProc;
  afterRangedAttack?: EquipmentProc;
  onMove?: EquipmentProc;
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
    let coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    while (map.contains(coordinates) && !isBlocked(map, coordinates)) {
      coordinates = Coordinates.plusDirection(coordinates, direction);
    }

    if (
      map.contains(coordinates) &&
      map.isTileRevealed(coordinates) &&
      map.getUnit(coordinates)
    ) {
      await state.getAbilityFactory().abilityForName(AbilityName.BOLT).use(unit, target);
    }
  }
};

const BowOfFrostScript: EquipmentScript = {
  afterRangedAttack: async (
    equipment: Equipment,
    target: Coordinates,
    _: GameState,
    session: Session
  ) => {
    const unit = checkNotNull(equipment.getUnit());
    const map = unit.getMap();
    const targetUnit = map.getUnit(target);
    if (targetUnit) {
      targetUnit.setFrozen(3);
      session
        .getTicker()
        .log(`${targetUnit.getName()} is frozen!`, { turn: session.getTurn() });
    }
  }
};

const BowOfFireScript: EquipmentScript = {
  afterRangedAttack: async (
    equipment: Equipment,
    target: Coordinates,
    _: GameState,
    session: Session
  ) => {
    const unit = checkNotNull(equipment.getUnit());
    const map = unit.getMap();
    const targetUnit = map.getUnit(target);
    if (targetUnit) {
      targetUnit.setBurning(5);
      session
        .getTicker()
        .log(`${targetUnit.getName()} is burned!`, { turn: session.getTurn() });
    }
  }
};

const FireSwordScript: EquipmentScript = {
  afterAttack: async (
    equipment: Equipment,
    target: Coordinates,
    _: GameState,
    session: Session
  ) => {
    const unit = checkNotNull(equipment.getUnit());
    const map = unit.getMap();
    const targetUnit = map.getUnit(target);
    if (targetUnit) {
      targetUnit.setBurning(5);
      session
        .getTicker()
        .log(`${targetUnit.getName()} is burned!`, { turn: session.getTurn() });
    }
  }
};

export namespace EquipmentScript {
  export const forName = (name: EquipmentScriptName): EquipmentScript => {
    switch (name) {
      case 'bolt_sword':
        return BoltSwordScript;
      case 'bow_of_fire':
        return BowOfFireScript;
      case 'bow_of_frost':
        return BowOfFrostScript;
      case 'fire_sword':
        return FireSwordScript;
      default:
        throw new Error(`Unknown equipment script ${name}`);
    }
  };
}
