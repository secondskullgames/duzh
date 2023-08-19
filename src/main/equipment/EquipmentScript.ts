import GameState from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import Equipment from './Equipment';
import { ShootBolt } from '../entities/units/abilities/ShootBolt';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import ItemFactory from '../items/ItemFactory';

export type EquipmentScriptName = 'bolt_sword';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  animationFactory: AnimationFactory,
  itemFactory: ItemFactory,
  ticker: Ticker
}>;

export type EquipmentScript = Readonly<{
  onAttack?: (
    equipment: Equipment,
    target: Coordinates,
    context: Context
  ) => Promise<void>;

  onMove?: (
    equipment: Equipment,
    target: Coordinates,
    context: Context
  ) => Promise<void>;
}>;

const BoltSwordScript: EquipmentScript = {
  onMove: async (
    equipment: Equipment,
    target: Coordinates,
    { state, map, spriteFactory, animationFactory, itemFactory, ticker }: Context
  ) => {
    const unit = checkNotNull(equipment.getUnit());

    const direction = unit.getDirection();
    let coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    while (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      coordinates = Coordinates.plus(coordinates, direction);
    }

    if (map.contains(coordinates) && map.isTileRevealed(coordinates) && map.getUnit(coordinates)) {
      await ShootBolt.use(
        unit,
        target,
        { state, map, spriteFactory, animationFactory, itemFactory, ticker }
      );
    }
  }
};

export namespace EquipmentScript {
  export const forName = (name: EquipmentScriptName): EquipmentScript => {
    switch (name) {
      case 'bolt_sword': return BoltSwordScript;
      default:           throw new Error(`Unknown equipment script ${name}`);
    }
  }
}