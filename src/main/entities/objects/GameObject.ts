import Entity from '../Entity';
import Sprite from '../../graphics/sprites/Sprite';
import { EntityType } from '../EntityType';
import MapInstance from '../../maps/MapInstance';
import { Coordinates } from '@main/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

export enum ObjectType {
  SPAWNER = 'spawner',
  DOOR = 'door',
  ITEM = 'item',
  BLOCK = 'block',
  BONUS = 'bonus'
}

type Props = Readonly<{
  coordinates: Coordinates;
  map: MapInstance;
  objectType: ObjectType;
  sprite: Sprite;
}>;

export default abstract class GameObject implements Entity {
  private coordinates: Coordinates;
  private map: MapInstance;
  private readonly objectType: ObjectType;
  private readonly sprite: Sprite | null;

  protected constructor({ coordinates, map, objectType, sprite }: Props) {
    this.coordinates = coordinates;
    this.map = map;
    this.objectType = objectType;
    this.sprite = sprite;
  }

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
  abstract playTurnAction: (state: GameState, session: Session) => Promise<void>;

  /** @override */
  abstract isBlocking: () => boolean;

  /** @override */
  getObjectType = (): ObjectType => this.objectType;
}
