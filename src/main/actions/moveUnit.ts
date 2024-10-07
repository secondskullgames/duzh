import Unit from '../units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { getBonus } from '@main/maps/MapUtils';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import { Game } from '@main/core/Game';

export const moveUnit = async (unit: Unit, coordinates: Coordinates, game: Game) => {
  const { session } = game;
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
      await EquipmentScript.forName(equipment.script).afterMove?.(
        equipment,
        nextCoordinates,
        game
      );
    }
  }

  const bonus = getBonus(map, coordinates);
  if (bonus) {
    await bonus.onUse(unit, game);
  }
};
