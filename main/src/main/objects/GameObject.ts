import Entity from '@main/entities/Entity';
import Sprite from '@main/graphics/sprites/Sprite';
import { EntityType } from '@main/entities/EntityType';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@duzh/geometry';

export enum ObjectType {
  SPAWNER = 'spawner',
  DOOR = 'door',
  ITEM = 'item',
  BLOCK = 'block',
  BONUS = 'bonus',
  SHRINE = 'shrine'
}

type Props = Readonly<{
  name: string;
  coordinates: Coordinates;
  map: MapInstance;
  objectType: ObjectType;
  sprite: Sprite;
}>;

export default abstract class GameObject implements Entity {
  protected coordinates: Coordinates;
  protected map: MapInstance;
  protected readonly name: string;
  protected readonly objectType: ObjectType;
  protected readonly sprite: Sprite | null;

  protected constructor({ name, coordinates, map, objectType, sprite }: Props) {
    this.name = name;
    this.coordinates = coordinates;
    this.map = map;
    this.objectType = objectType;
    this.sprite = sprite;
  }

  /** @override */
  getName = (): string => this.name;

  /** @override */
  getCoordinates = (): Coordinates => this.coordinates;

  /** @override */
  setCoordinates = (coordinates: Coordinates) => {
    this.coordinates = coordinates;
  };

  /** @override {@link Entity#getMap} */
  getMap = (): MapInstance => this.map;

  /** @override {@link Entity#setMap} */
  setMap = (map: MapInstance) => {
    this.map = map;
  };

  /** @override */
  getSprite = (): Sprite | null => this.sprite;

  /** @override */
  getType = (): EntityType => EntityType.OBJECT;

  /** @override */
  abstract isBlocking: () => boolean;

  /** @override */
  getObjectType = (): ObjectType => this.objectType;
}
