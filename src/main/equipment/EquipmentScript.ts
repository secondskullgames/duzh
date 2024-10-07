import Equipment from './Equipment';
import { Coordinates } from '@lib/geometry/Coordinates';
import { checkNotNull } from '@lib/utils/preconditions';
import { isBlocked } from '@main/maps/MapUtils';
import { ShootBolt } from '@main/abilities/ShootBolt';
import { Game } from '@main/core/Game';

export type EquipmentScriptName =
  | 'bolt_sword'
  | 'bow_of_fire'
  | 'bow_of_frost'
  | 'fire_sword';

type EquipmentProc = (
  equipment: Equipment,
  target: Coordinates,
  game: Game
) => Promise<void>;

export type EquipmentScript = Readonly<{
  beforeAttack?: EquipmentProc;
  afterAttack?: EquipmentProc;
  afterRangedAttack?: EquipmentProc;
  afterMove?: EquipmentProc;
}>;

const BoltSwordScript: EquipmentScript = {
  afterMove: async (equipment: Equipment, target: Coordinates, game: Game) => {
    const { session } = game;
    const map = session.getMap();
    const unit = checkNotNull(equipment.getUnit());
    // TODO need to store this somewhere, on the equipment maybe?
    const ability = new ShootBolt();

    const direction = unit.getDirection();
    let coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    while (map.contains(coordinates) && !isBlocked(coordinates, map)) {
      coordinates = Coordinates.plusDirection(coordinates, direction);
    }

    if (
      map.contains(coordinates) &&
      map.isTileRevealed(coordinates) &&
      map.getUnit(coordinates)
    ) {
      await ability.use(unit, target, game);
    }
  }
};

const BowOfFrostScript: EquipmentScript = {
  afterRangedAttack: async (equipment: Equipment, target: Coordinates, game: Game) => {
    const { session, ticker } = game;
    const unit = checkNotNull(equipment.getUnit());
    const map = unit.getMap();
    const targetUnit = map.getUnit(target);
    if (targetUnit) {
      targetUnit.setFrozen(3);
      ticker.log(`${targetUnit.getName()} is frozen!`, { turn: session.getTurn() });
    }
  }
};

const BowOfFireScript: EquipmentScript = {
  afterRangedAttack: async (equipment: Equipment, target: Coordinates, game: Game) => {
    const { session, ticker } = game;
    const unit = checkNotNull(equipment.getUnit());
    const map = unit.getMap();
    const targetUnit = map.getUnit(target);
    if (targetUnit) {
      targetUnit.setBurning(5);
      ticker.log(`${targetUnit.getName()} is burned!`, { turn: session.getTurn() });
    }
  }
};

const FireSwordScript: EquipmentScript = {
  afterAttack: async (equipment: Equipment, target: Coordinates, game: Game) => {
    const { session, ticker } = game;
    const unit = checkNotNull(equipment.getUnit());
    const map = unit.getMap();
    const targetUnit = map.getUnit(target);
    if (targetUnit) {
      targetUnit.setBurning(5);
      ticker.log(`${targetUnit.getName()} is burned!`, { turn: session.getTurn() });
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
