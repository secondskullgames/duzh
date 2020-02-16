import { Coordinates, Room, Tile } from '../types';
import Unit from './Unit';
import MapItem from './MapItem';
import MapInstance from './MapInstance';

interface MapSupplier {
  level: number,
  width: number,
  height: number,
  tiles: Tile[][],
  rooms: Room[],
  playerUnitLocation: Coordinates,
  enemyUnitLocations: Coordinates[],
  enemyUnitSupplier: (Coordinates, level: number) => Unit,
  itemLocations: Coordinates[],
  itemSupplier: (Coordinates) => MapItem
}

function createMap(mapSupplier: MapSupplier): MapInstance {
  const {
    level,
    width,
    height,
    tiles,
    rooms,
    playerUnitLocation,
    enemyUnitLocations,
    enemyUnitSupplier,
    itemLocations,
    itemSupplier
  } = mapSupplier;
  const { playerUnit } = jwb.state;
  const units = [playerUnit];
  [playerUnit.x, playerUnit.y] = [playerUnitLocation.x, playerUnitLocation.y];
  units.push(...enemyUnitLocations.map(({ x, y }) => enemyUnitSupplier({ x, y }, level)));
  const items = itemLocations.map(({ x, y }) => itemSupplier({ x, y }));
  return new MapInstance(
    width,
    height,
    tiles,
    rooms,
    units,
    items
  )
}

export default MapSupplier;
export { createMap };