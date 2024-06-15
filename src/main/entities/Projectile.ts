import Entity from './Entity';
import { EntityType } from './EntityType';
import Sprite from '../graphics/sprites/Sprite';
import MapInstance from '../maps/MapInstance';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';

type Props = Readonly<{
  name: string;
  coordinates: Coordinates;
  map: MapInstance;
  direction: Direction;
  sprite: Sprite;
}>;

export default class Projectile implements Entity {
  private readonly name: string;
  private coordinates: Coordinates;
  private map: MapInstance;
  private readonly direction: Direction;
  private readonly sprite: Sprite;

  constructor({ name, coordinates, map, direction, sprite }: Props) {
    this.name = name;
    this.coordinates = coordinates;
    this.map = map;
    this.direction = direction;
    this.sprite = sprite;
  }

  /** @override */
  getName = (): string => this.name;

  /** @override {@link Entity#getCoordinates} */
  getCoordinates = (): Coordinates => this.coordinates;

  /**
   * @override {@link Entity#setCoordinates}
   */
  setCoordinates = (coordinates: Coordinates) => {
    this.coordinates = coordinates;
  };

  /** @override {@link Entity#getMap} */
  getMap = (): MapInstance => this.map;

  /** @override {@link Entity#setMap} */
  setMap = (map: MapInstance) => {
    this.map = map;
  };

  /** @override {@link Entity#getSprite} */
  getSprite = (): Sprite => this.sprite;

  /** @override {@link Entity#update} */
  playTurnAction = async () => {};

  /** @override {@link Entity#isBlocking} */
  isBlocking = (): boolean => false;

  /** @override {@link Entity#getType} */
  getType = (): EntityType => EntityType.PROJECTILE;

  getDirection = (): Direction => this.direction;
}
