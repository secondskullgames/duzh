import MapInstance from './MapInstance';
import Spawner from '../objects/Spawner';
import MapItem from '../objects/MapItem';
import Door from '../objects/Door';
import Block from '../objects/Block';
import Bonus from '../objects/Bonus';
import { Coordinates } from '@duzh/geometry';
import { ObjectType } from '@main/objects/GameObject';
import { Heuristic, Pathfinder } from '@main/geometry/Pathfinder';
import Shrine from '@main/objects/Shrine';
import Unit from '@main/units/Unit';

export const getSpawner = (
  map: MapInstance,
  coordinates: Coordinates
): Spawner | null => {
  return (
    map
      .getObjects(coordinates)
      .filter(object => object.getObjectType() === ObjectType.SPAWNER)
      .map(object => object as Spawner)[0] ?? null
  );
};

export const getItem = (map: MapInstance, coordinates: Coordinates): MapItem | null => {
  return (
    map
      .getObjects(coordinates)
      .filter(object => object.getObjectType() === ObjectType.ITEM)
      .map(object => object as MapItem)[0] ?? null
  );
};

export const getDoor = (map: MapInstance, coordinates: Coordinates): Door | null => {
  return (
    map
      .getObjects(coordinates)
      .filter(object => object.getObjectType() === ObjectType.DOOR)
      .map(object => object as Door)[0] ?? null
  );
};

export const getMovableBlock = (
  map: MapInstance,
  coordinates: Coordinates
): Block | null => {
  return (
    map
      .getObjects(coordinates)
      .filter(object => object.getObjectType() === ObjectType.BLOCK)
      .map(object => object as Block)
      .find(block => block.isMovable()) ?? null
  );
};

export const getShrine = (map: MapInstance, coordinates: Coordinates): Shrine | null => {
  return (
    map
      .getObjects(coordinates)
      .filter(object => object.getObjectType() === ObjectType.SHRINE)
      .map(object => object as Shrine)[0] ?? null
  );
};

export const getBonus = (map: MapInstance, coordinates: Coordinates): Bonus | null => {
  return (
    map
      .getObjects(coordinates)
      .filter(object => object.getObjectType() === ObjectType.BONUS)
      .map(object => object as Bonus)[0] ?? null
  );
};

export const getAllCoordinates = (map: MapInstance): Coordinates[] => {
  const allCoordinates = [];
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      allCoordinates.push({ x, y });
    }
  }
  return allCoordinates;
};

export const isBlocked = (coordinates: Coordinates, map: MapInstance): boolean => {
  return (
    !map.contains(coordinates) ||
    map.getTile(coordinates).isBlocking() ||
    map.getUnit(coordinates) !== null ||
    map.getObjects(coordinates).some(object => object.isBlocking())
  );
};

export const revealMap = (map: MapInstance) => {
  for (const coordinates of getAllCoordinates(map)) {
    map.revealTile(coordinates);
  }
};

export const findPath = (
  start: Coordinates,
  end: Coordinates,
  map: MapInstance
): Coordinates[] => {
  const unblockedCoordinatesList: Coordinates[] = [];
  const { width, height } = map.getRect();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const coordinates = { x, y };
      if (Coordinates.equals(coordinates, end)) {
        unblockedCoordinatesList.push(coordinates);
      } else if (!isBlocked(coordinates, map)) {
        unblockedCoordinatesList.push(coordinates);
      } else {
        // blocked
      }
    }
  }

  const pathfinder = Pathfinder.create({ heuristic: Heuristic.EUCLIDEAN });
  return pathfinder.findPath(start, end, unblockedCoordinatesList);
};

export const hasUnblockedStraightLineBetween = (
  map: MapInstance,
  startCoordinates: Coordinates,
  targetCoordinates: Coordinates
): boolean => {
  let { x, y } = startCoordinates;
  const { x: targetX, y: targetY } = targetCoordinates;
  const dx = Math.sign(targetX - x);
  const dy = Math.sign(targetY - y);
  x += dx;
  y += dy;

  while (x !== targetX || y !== targetY) {
    if (isBlocked({ x, y }, map)) {
      return false;
    }
    x += dx;
    y += dy;
  }
  return true;
};

export const getUnitsOfClass = (map: MapInstance, unitClass: string) => {
  return map.getAllUnits().filter(unit => unit.getUnitClass() === unitClass);
};

export const isOccupied = (map: MapInstance, coordinates: Coordinates) => {
  return map.getObjects(coordinates).length > 0 || map.getUnit(coordinates) !== null;
};

export const getEnemyUnit = (
  unit: Unit,
  coordinates: Coordinates,
  map: MapInstance
): Unit | null => {
  const targetUnit = map.getUnit(coordinates);
  if (targetUnit && targetUnit.getFaction() !== unit.getFaction()) {
    return targetUnit;
  }
  return null;
};
