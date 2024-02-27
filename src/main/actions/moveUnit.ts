import { Unit } from '@main/entities/units';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { getBonus } from '@main/maps/MapUtils';
import { Coordinates } from '@main/geometry';
import { GameState, Session } from '@main/core';

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

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.script) {
      // TODO - why are we using the next coordinates?
      const nextCoordinates = Coordinates.plus(
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
