import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { EquipmentScript } from '../equipment/EquipmentScript';
import GameState from '../core/GameState';
import GameRenderer from '../graphics/renderers/GameRenderer';
import ImageFactory from '../graphics/images/ImageFactory';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export const moveUnit = async (
  unit: Unit,
  coordinates: Coordinates,
  { state, renderer, imageFactory }: Props
) => {
  const map = state.getMap();
  map.removeUnit(unit);

  unit.setCoordinates(coordinates);
  map.addUnit(unit);

  const playerUnit = state.getPlayerUnit();
  if (unit === playerUnit) {
    playSound(Sounds.FOOTSTEP);
  }

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.script) {
      const nextCoordinates = Coordinates.plus(unit.getCoordinates(), unit.getDirection());
      await EquipmentScript.onMove(
        equipment,
        equipment.script,
        nextCoordinates,
        { state, renderer, imageFactory }
      );
    }
  }
};