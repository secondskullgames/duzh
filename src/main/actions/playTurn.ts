import { updateRevealedTiles } from './updateRevealedTiles';
import Unit from '../entities/units/Unit';
import { sortBy } from '@main/utils/arrays';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import MapInstance from '@main/maps/MapInstance';
import { checkNotNull } from '@main/utils/preconditions';
import { randChance, randChoice } from '@main/utils/random';
import { Faction } from '@main/entities/units/Faction';
import { UnitController } from '@main/entities/units/controllers/UnitController';
import Coordinates from '@main/geometry/Coordinates';
import { PlayerUnitClass } from '@main/entities/units/PlayerUnitClass';
import { chooseUnitController } from '@main/entities/units/controllers/ControllerUtils';
import { isBlocked } from '@main/maps/MapUtils';

export const playTurn = async (state: GameState, session: Session) => {
  const map = session.getMap();
  session.setTurnInProgress(true);
  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    if (unit.getLife() > 0) {
      await unit.playTurnAction(state, session);
    }
  }

  for (const object of map.getAllObjects()) {
    await object.playTurnAction(state, session);
  }

  updateRevealedTiles(map, session.getPlayerUnit());

  await doMapEvents(map, state);

  session.nextTurn();
  session.setTurnInProgress(false);
};

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] =>
  sortBy(units, unit => (unit.getFaction() === 'PLAYER' ? 0 : 1));

const doMapEvents = async (map: MapInstance, state: GameState) => {
  const fogParams = map.getFogParams();
  if (fogParams.enabled && fogParams.spawnEnemies) {
    const spawnRate = checkNotNull(fogParams.spawnRate);
    const unitFactory = state.getUnitFactory();
    if (randChance(spawnRate)) {
      const targetSpawnCoordinates = _getFogSpawnCoordinates(map);
      if (targetSpawnCoordinates) {
        // TODO would be nice if this was a one-liner
        const unitClass = checkNotNull(fogParams.spawnedUnitClass);
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
