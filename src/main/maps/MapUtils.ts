import MapInstance from './MapInstance';
import Spawner from '../entities/objects/Spawner';
import MapItem from '../entities/objects/MapItem';
import Door from '../entities/objects/Door';
import Block from '../entities/objects/Block';
import Bonus from '../entities/objects/Bonus';
import { ObjectType } from '@main/entities/objects/GameObject';
import { Coordinates, Pathfinder } from '@main/geometry';

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

export const isBlocked = (map: MapInstance, coordinates: Coordinates): boolean => {
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
      } else if (!isBlocked(map, coordinates)) {
        unblockedCoordinatesList.push(coordinates);
      } else {
        // blocked
      }
    }
  }

  return Pathfinder.create().findPath(start, end, unblockedCoordinatesList);
};
