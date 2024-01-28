import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import { EquipmentScript } from '../equipment/EquipmentScript';
import { GameState } from '../core/GameState';
import { getBonus } from '../maps/MapUtils';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
  session: Session;
}>;

export const moveUnit = async (
  unit: Unit,
  coordinates: Coordinates,
  { state, map, session }: Context
) => {
  map.removeUnit(unit);

  unit.setCoordinates(coordinates);
  map.addUnit(unit);

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.script) {
      const nextCoordinates = Coordinates.plus(
        unit.getCoordinates(),
        unit.getDirection()
      );
      await EquipmentScript.forName(equipment.script).onMove?.(
        equipment,
        nextCoordinates,
        { state, map, session }
      );
    }
  }

  const bonus = getBonus(map, coordinates);
  if (bonus) {
    await bonus.onUse(unit, { state, map, session });
  }
};
