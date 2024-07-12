import Unit from '../units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { GameState } from '@main/core/GameState';
import { getBonus } from '@main/maps/MapUtils';
import { Session } from '@main/core/Session';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';

export const moveUnit = async (
  unit: Unit,
  coordinates: Coordinates,
  session: Session,
  state: GameState
) => {
  const map = unit.getMap();
  map.removeUnit(unit);

  unit.setCoordinates(coordinates);
  map.addUnit(unit);
  if (unit === session.getPlayerUnit()) {
    updateRevealedTiles(map, unit);
  }

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.script) {
      // TODO - why are we using the next coordinates?
      const nextCoordinates = Coordinates.plusDirection(
        unit.getCoordinates(),
        unit.getDirection()
      );
      await EquipmentScript.forName(equipment.script).onMove?.(
        equipment,
        nextCoordinates,
        state,
        session
      );
    }
  }

  const bonus = getBonus(map, coordinates);
  if (bonus) {
    await bonus.onUse(unit, state, session);
  }
};
