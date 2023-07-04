import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import { EquipmentScript } from '../equipment/EquipmentScript';
import { getBonus } from '../maps/MapUtils';
import { GlobalContext } from '../core/GlobalContext';

export const moveUnit = async (
  unit: Unit,
  coordinates: Coordinates,
  context: GlobalContext
) => {
  const { state } = context;
  const map = state.getMap();
  map.removeUnit(unit);

  unit.setCoordinates(coordinates);
  map.addUnit(unit);

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.script) {
      const nextCoordinates = Coordinates.plus(unit.getCoordinates(), unit.getDirection());
      await EquipmentScript.forName(equipment.script).onMove?.(
        equipment,
        nextCoordinates,
        context
      );
    }
  }

  const bonus = getBonus(map, coordinates);
  if (bonus) {
    await bonus.onUse(unit, context);
  }
};