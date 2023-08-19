import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import { EquipmentScript } from '../equipment/EquipmentScript';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import { getBonus } from '../maps/MapUtils';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import ItemFactory from '../items/ItemFactory';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  animationFactory: AnimationFactory,
  itemFactory: ItemFactory,
  ticker: Ticker
}>;

export const moveUnit = async (
  unit: Unit,
  coordinates: Coordinates,
  { state, map, spriteFactory, animationFactory, itemFactory, ticker }: Context
) => {
  map.removeUnit(unit);

  unit.setCoordinates(coordinates);
  map.addUnit(unit);

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.script) {
      const nextCoordinates = Coordinates.plus(unit.getCoordinates(), unit.getDirection());
      await EquipmentScript.forName(equipment.script).onMove?.(
        equipment,
        nextCoordinates,
        { state, map, spriteFactory, animationFactory, itemFactory, ticker }
      );
    }
  }

  const bonus = getBonus(map, coordinates);
  if (bonus) {
    await bonus.onUse(unit, { state, map, ticker });
  }
};