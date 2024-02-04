import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import { EquipmentScript } from '../equipment/EquipmentScript';
import { GameState } from '../core/GameState';
import { getBonus } from '../maps/MapUtils';
import { Session } from '../core/Session';

export const moveUnit = async (
  unit: Unit,
  coordinates: Coordinates,
  session: Session,
  state: GameState
) => {
  const map = session.getMap();
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
        { state, session }
      );
    }
  }

  const bonus = getBonus(map, coordinates);
  if (bonus) {
    await bonus.onUse(unit, { state, map, session });
  }
};
