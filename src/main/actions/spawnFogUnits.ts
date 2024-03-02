import MapInstance from '@main/maps/MapInstance';
import { GameState } from '@main/core/GameState';
import { checkNotNull } from '@main/utils/preconditions';
import { randChance, randChoice } from '@main/utils/random';
import { Faction } from '@main/entities/units/Faction';
import { chooseUnitController } from '@main/entities/units/controllers/ControllerUtils';
import Coordinates from '@main/geometry/Coordinates';
import { getUnitsOfClass, isBlocked } from '@main/maps/MapUtils';
import { Session } from '@main/core/Session';

export const spawnFogUnits = async (state: GameState, session: Session) => {
  const map = session.getMap();
  const fogParams = map.getFogParams();

  const areSpawnsEnabled = fogParams?.enabled && (fogParams.spawnEnemies ?? false);

  if (areSpawnsEnabled) {
    const spawnRate = checkNotNull(fogParams.spawnRate);
    const unitClass = checkNotNull(fogParams.spawnedUnitClass);
    const maxSpawnedUnits = checkNotNull(fogParams.maxSpawnedUnits);
    const unitsOfClass = getUnitsOfClass(map, unitClass);
    if (unitsOfClass.length >= maxSpawnedUnits) {
      return;
    }
    const unitFactory = state.getUnitFactory();
    if (randChance(spawnRate)) {
      const targetSpawnCoordinates = _getFogSpawnCoordinates(map);
      if (targetSpawnCoordinates) {
        // TODO would be nice if this was a one-liner
        const unitModel = await state.getModelLoader().loadUnitModel(unitClass);
        const unit = await unitFactory.createUnit({
          name: unitModel.name,
          unitClass,
          faction: Faction.ENEMY,
          controller: chooseUnitController(unitClass),
          level: map.levelNumber,
          coordinates: targetSpawnCoordinates,
          map
        });
        map.addUnit(unit);
      }
    }
  }
};

const _getFogSpawnCoordinates = (map: MapInstance): Coordinates | null => {
  const allTiles = map.getTiles().flat();
  const candidateCoordinates = allTiles
    .map(tile => tile.getCoordinates())
    .filter(
      coordinates => !map.isTileRevealed(coordinates) && !isBlocked(map, coordinates)
    );
  return candidateCoordinates.length > 0 ? randChoice(candidateCoordinates) : null;
};
