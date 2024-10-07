import MapInstance from '@main/maps/MapInstance';
import { checkNotNull } from '@lib/utils/preconditions';
import { randChance, randChoice } from '@lib/utils/random';
import { Faction } from '@main/units/Faction';
import { chooseUnitController } from '@main/units/controllers/ControllerUtils';
import { Coordinates } from '@lib/geometry/Coordinates';
import { getUnitsOfClass, isBlocked } from '@main/maps/MapUtils';
import { Session } from '@main/core/Session';
import { Feature } from '@main/utils/features';
import { hypotenuse } from '@lib/geometry/CoordinatesUtils';
import { Game } from '@main/core/Game';

export const spawnFogUnits = async (map: MapInstance, game: Game) => {
  const { session, unitFactory, modelLoader } = game;
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
    if (randChance(spawnRate)) {
      const targetSpawnCoordinates = _getFogSpawnCoordinates(map, session);
      if (targetSpawnCoordinates) {
        // TODO would be nice if this was a one-liner
        const unitModel = await modelLoader.loadUnitModel(unitClass);
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

const _getFogSpawnCoordinates = (
  map: MapInstance,
  session: Session
): Coordinates | null => {
  const allTiles = map.getTiles().flat();
  const candidateCoordinates = (() => {
    if (Feature.isEnabled(Feature.FOG_SHADES_EVERYWHERE)) {
      const playerUnit = session.getPlayerUnit();
      const minDistanceWaway = 10;
      return allTiles
        .map(tile => tile.getCoordinates())
        .filter(
          coordinates =>
            hypotenuse(coordinates, playerUnit.getCoordinates()) >= minDistanceWaway &&
            !isBlocked(coordinates, map)
        );
    } else {
      return allTiles
        .map(tile => tile.getCoordinates())
        .filter(
          coordinates => !map.isTileRevealed(coordinates) && !isBlocked(coordinates, map)
        );
    }
  })();
  return candidateCoordinates.length > 0 ? randChoice(candidateCoordinates) : null;
};
