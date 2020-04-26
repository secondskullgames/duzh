declare module "graphics/ImageUtils" {
    import { PaletteSwaps } from "types/types";
    type RGB = [number, number, number];
    function loadImage(filename: string): Promise<ImageData>;
    function applyTransparentColor(imageData: ImageData, transparentColor: string): Promise<ImageData>;
    function replaceColors(imageData: ImageData, colorMap: PaletteSwaps): Promise<ImageData>;
    /**
     * Replace all non-transparent colors with the specified `color`.
     */
    function replaceAll(imageData: ImageData, color: string): Promise<ImageData>;
    /**
     * Convert a hex string, e.g. '#00c0ff', to its equivalent RGB values, e.g. (0, 192, 255).
     * This implementation relies on the browser automatically doing this conversion when
     * an element's `backgroundColor` value is set.
     */
    function hex2rgb(hex: string): RGB;
    export { loadImage, applyTransparentColor, replaceColors, replaceAll, hex2rgb };
}
declare module "utils/PromiseUtils" {
    function resolvedPromise(value?: any): Promise<any>;
    type PromiseSupplier<T> = (t?: T) => Promise<T>;
    function chainPromises<T>([first, ...rest]: PromiseSupplier<T>[], input?: T): Promise<any>;
    function wait(milliseconds: number): Promise<void>;
    export { chainPromises, resolvedPromise, wait };
}
declare module "graphics/ImageSupplier" {
    import { PaletteSwaps } from "types/types";
    type ImageDataFunc = (imageData: ImageData) => Promise<ImageData>;
    class ImageSupplier {
        private readonly _imageSupplier;
        private _image;
        /**
         * @param effects A list of custom transformations to be applied to the image, in order
         */
        constructor(filename: string, transparentColor: string, paletteSwaps?: PaletteSwaps, effects?: ImageDataFunc[]);
        get(): Promise<ImageBitmap>;
    }
    export default ImageSupplier;
}
declare module "graphics/sprites/Sprite" {
    import ImageSupplier from "graphics/ImageSupplier";
    /**
     * Note: It's expected that a separate Sprite instance will be created
     * per entity, and frame caching will be handled... somewhere else
     */
    class Sprite {
        dx: number;
        dy: number;
        key: string;
        private readonly _imageMap;
        constructor(imageMap: {
            [filename: string]: ImageSupplier;
        }, key: string, { dx, dy }: {
            dx: number;
            dy: number;
        });
        getImage(): Promise<ImageBitmap>;
        /**
         * This will be overridden by individual sprites to handle
         * e.g. unit-specific logic
         */
        update(): Promise<any>;
    }
    export default Sprite;
}
declare module "types/Colors" {
    enum Colors {
        BLACK = "#000000",
        WHITE = "#FFFFFF",
        DARK_GRAY = "#808080",
        LIGHT_GRAY = "#C0C0C0",
        DARK_RED = "#800000",
        RED = "#FF0000",
        DARK_YELLOW = "#808000",
        YELLOW = "#FFFF00",
        DARK_GREEN = "#008000",
        GREEN = "#00FF00",
        DARK_TEAL = "#004040",
        CYAN = "#00FFFF",
        DARK_BLUE = "#000080",
        BLUE = "#0000FF",
        DARK_PURPLE = "#800080",
        MAGENTA = "#FF00FF",
        DARK_BROWN = "#804000",
        LIGHT_BROWN = "#c08040",
        ORANGE = "#ff8040",
        LIGHT_PINK = "#ffc0c0",
        MEDIUM_RED = "#c00000",
        MEDIUM_BLUE = "#0000c0",
        DARKER_GRAY = "#404040",
        TEAL = "#008080"
    }
    export default Colors;
}
declare module "types/types" {
    import Sprite from "graphics/sprites/Sprite";
    import Colors from "types/Colors";
    enum Activity {
        STANDING = "STANDING",
        WALKING = "WALKING",
        ATTACKING = "ATTACKING",
        DAMAGED = "DAMAGED"
    }
    interface Coordinates {
        x: number;
        y: number;
    }
    type CoordinatePair = [Coordinates, Coordinates];
    interface Direction {
        dx: number;
        dy: number;
    }
    interface Entity extends Coordinates {
        char: string;
        sprite: Sprite;
    }
    enum EquipmentSlot {
        MELEE_WEAPON = "MELEE_WEAPON",
        RANGED_WEAPON = "RANGED_WEAPON",
        ARMOR = "ARMOR"
    }
    enum GameScreen {
        GAME = "GAME",
        INVENTORY = "INVENTORY"
    }
    enum ItemCategory {
        POTION = "POTION",
        SCROLL = "SCROLL",
        WEAPON = "WEAPON"
    }
    interface MapSection {
        width: number;
        height: number;
        rooms: Room[];
        tiles: TileType[][];
    }
    enum MapLayout {
        ROOMS_AND_CORRIDORS = "ROOMS_AND_CORRIDORS",
        BLOB = "BLOB"
    }
    type PaletteSwaps = {
        [src in Colors]?: Colors;
    };
    interface Projectile extends Entity, Coordinates {
        direction: Direction;
    }
    interface Rect {
        left: number;
        top: number;
        width: number;
        height: number;
    }
    interface Room extends Rect {
        exits: Coordinates[];
    }
    type Sample = [number, number];
    type SpriteSupplier = (paletteSwaps?: PaletteSwaps) => Sprite;
    interface Tile {
        type: TileType;
        sprite: Sprite | null;
        isBlocking: boolean;
    }
    type TileSet = {
        [tileType in TileType]: (Sprite | null)[];
    };
    enum TileType {
        FLOOR = 0,
        FLOOR_HALL = 1,
        WALL_TOP = 2,
        WALL_HALL = 3,
        WALL = 4,
        NONE = 5,
        STAIRS_DOWN = 6
    }
    enum UnitType {
        HUMAN = "HUMAN",
        ELEMENTAL = "ELEMENTAL",
        GHOST = "GHOST",
        GOLEM = "GOLEM",
        WIZARD = "WIZARD",
        ANIMAL = "ANIMAL"
    }
    export { Activity, Coordinates, CoordinatePair, Direction, Entity, EquipmentSlot, GameScreen, ItemCategory, MapLayout, MapSection, PaletteSwaps, Projectile, Rect, Room, Sample, SpriteSupplier, Tile, TileSet, TileType, UnitType };
}
declare module "utils/ArrayUtils" {
    function sortBy<T>(list: T[], mapFunction: (t: T) => number): T[];
    function sortByReversed<T>(list: T[], mapFunction: (t: T) => number): T[];
    function comparing<T>(mapFunction: (t: T) => number): (a: T, b: T) => number;
    function comparingReversed<T>(mapFunction: (t: T) => number): (a: T, b: T) => number;
    function average(list: number[]): number;
    export { sortBy, sortByReversed, comparing, comparingReversed, average };
}
declare module "utils/RandomUtils" {
    /**
     * @param max inclusive
     */
    function randInt(min: number, max: number): number;
    function randChoice<T>(list: T[]): T;
    /**
     * Fisher-Yates.  Stolen from https://bost.ocks.org/mike/shuffle/
     */
    function shuffle<T>(list: T[]): void;
    function weightedRandom<T>(probabilities: {
        [key: string]: number;
    }, mappedObjects: {
        [key: string]: T;
    }): T;
    export { randInt, randChoice, weightedRandom, shuffle };
}
declare module "maps/MapUtils" {
    import { Coordinates, Rect, Tile, TileSet } from "types/types";
    import { TileType } from "types/types";
    /**
     * @return `numToChoose` random points from `tiles`, whose tile is in `allowedTileTypes`,
     *         which do not collide with `occupiedLocations`
     */
    function pickUnoccupiedLocations(tiles: TileType[][], allowedTileTypes: TileType[], occupiedLocations: Coordinates[], numToChoose: number): Coordinates[];
    function coordinatesEquals(first: Coordinates, second: Coordinates): boolean;
    function contains(rect: Rect, coordinates: Coordinates): boolean;
    function manhattanDistance(first: Coordinates, second: Coordinates): number;
    function hypotenuse(first: Coordinates, second: Coordinates): number;
    function civDistance(first: Coordinates, second: Coordinates): number;
    function isAdjacent(first: Coordinates, second: Coordinates): boolean;
    function isTileRevealed({ x, y }: Coordinates): boolean;
    function isBlocking(tileType: TileType): boolean;
    function createTile(type: TileType, tileSet: TileSet): Tile;
    export { pickUnoccupiedLocations, civDistance, manhattanDistance, hypotenuse, contains, coordinatesEquals, isAdjacent, isTileRevealed, isBlocking, createTile };
}
declare module "utils/Pathfinder" {
    import { Coordinates, Rect } from "types/types";
    /**
     * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
     */
    class Pathfinder {
        private readonly blockedTileDetector;
        private readonly tileCostCalculator;
        /**
         * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
         */
        constructor(blockedTileDetector: ({ x, y }: Coordinates) => boolean, tileCostCalculator: (first: Coordinates, second: Coordinates) => number);
        /**
         * http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch
         */
        findPath(start: Coordinates, goal: Coordinates, rect: Rect): Coordinates[];
        private _findNeighbors;
    }
    export default Pathfinder;
}
declare module "sounds/SoundPlayer" {
    import { Sample } from "types/types";
    class SoundPlayer {
        private readonly _context;
        private readonly _gainNode;
        private _oscillators;
        constructor(maxPolyphony: number, gain: number);
        private _newOscillator;
        stop(): void;
        playSound(samples: Sample[], repeating?: boolean): void;
    }
    export default SoundPlayer;
}
declare module "sounds/AudioUtils" {
    import { Sample } from "types/types";
    function playSound(samples: Sample[]): void;
    function playMusic(samples: Sample[]): void;
    export { playSound, playMusic };
}
declare module "sounds/Sounds" {
    const Sounds: {
        [key: string]: [number, number][];
    };
    export default Sounds;
}
declare module "types/Directions" {
    import { Direction } from "types/types";
    function _directionToString(direction: Direction): "N" | "E" | "S" | "W";
    const _default: {
        N: {
            dx: number;
            dy: number;
        };
        E: {
            dx: number;
            dy: number;
        };
        S: {
            dx: number;
            dy: number;
        };
        W: {
            dx: number;
            dy: number;
        };
        values: () => {
            dx: number;
            dy: number;
        }[];
        toString: typeof _directionToString;
    };
    export default _default;
}
declare module "graphics/sprites/units/UnitSprite" {
    import Sprite from "graphics/sprites/Sprite";
    import Unit from "units/Unit";
    import { PaletteSwaps } from "types/types";
    abstract class UnitSprite extends Sprite {
        private _unit;
        protected constructor(unit: Unit, spriteName: string, paletteSwaps: PaletteSwaps, spriteOffsets: {
            dx: number;
            dy: number;
        });
        update(): Promise<any>;
        private _getKey;
    }
    export default UnitSprite;
}
declare module "graphics/sprites/units/PlayerSprite" {
    import { PaletteSwaps } from "types/types";
    import Unit from "units/Unit";
    import UnitSprite from "graphics/sprites/units/UnitSprite";
    class PlayerSprite extends UnitSprite {
        constructor(unit: Unit, paletteSwaps: PaletteSwaps);
    }
    export default PlayerSprite;
}
declare module "graphics/sprites/units/GolemSprite" {
    import { PaletteSwaps } from "types/types";
    import Unit from "units/Unit";
    import UnitSprite from "graphics/sprites/units/UnitSprite";
    class GolemSprite extends UnitSprite {
        constructor(unit: Unit, paletteSwaps: PaletteSwaps);
    }
    export default GolemSprite;
}
declare module "graphics/sprites/units/GruntSprite" {
    import { PaletteSwaps } from "types/types";
    import Unit from "units/Unit";
    import UnitSprite from "graphics/sprites/units/UnitSprite";
    class GruntSprite extends UnitSprite {
        constructor(unit: Unit, paletteSwaps: PaletteSwaps);
    }
    export default GruntSprite;
}
declare module "graphics/sprites/units/SnakeSprite" {
    import { PaletteSwaps } from "types/types";
    import Unit from "units/Unit";
    import UnitSprite from "graphics/sprites/units/UnitSprite";
    class SnakeSprite extends UnitSprite {
        constructor(unit: Unit, paletteSwaps: PaletteSwaps);
    }
    export default SnakeSprite;
}
declare module "graphics/sprites/units/SoldierSprite" {
    import { PaletteSwaps } from "types/types";
    import Unit from "units/Unit";
    import UnitSprite from "graphics/sprites/units/UnitSprite";
    class SoldierSprite extends UnitSprite {
        constructor(unit: Unit, paletteSwaps: PaletteSwaps);
    }
    export default SoldierSprite;
}
declare module "graphics/sprites/projectiles/ProjectileSprite" {
    import Sprite from "graphics/sprites/Sprite";
    import { Direction, PaletteSwaps } from "types/types";
    /**
     * Projectiles have a direction but no activity or frame numbers
     */
    abstract class ProjectileSprite extends Sprite {
        private readonly _direction;
        protected constructor(direction: Direction, spriteName: string, paletteSwaps: PaletteSwaps, spriteOffsets: {
            dx: number;
            dy: number;
        });
        update(): Promise<any>;
    }
    export default ProjectileSprite;
}
declare module "graphics/sprites/projectiles/ArrowSprite" {
    import ProjectileSprite from "graphics/sprites/projectiles/ProjectileSprite";
    import { Direction, PaletteSwaps } from "types/types";
    class ArrowSprite extends ProjectileSprite {
        constructor(direction: Direction, paletteSwaps: PaletteSwaps);
    }
    export default ArrowSprite;
}
declare module "graphics/sprites/SpriteFactory" {
    import ImageSupplier from "graphics/ImageSupplier";
    import Sprite from "graphics/sprites/Sprite";
    import Unit from "units/Unit";
    import { Direction, PaletteSwaps, SpriteSupplier } from "types/types";
    type UnitSpriteSupplier = (unit: Unit, paletteSwaps: PaletteSwaps) => Sprite;
    type ProjectileSpriteSupplier = (direction: Direction, paletteSwaps: PaletteSwaps) => Sprite;
    function createStaticSprite(imageLoader: ImageSupplier, { dx, dy }: {
        dx: number;
        dy: number;
    }): Sprite;
    const _default_1: {
        MAP_SWORD: SpriteSupplier;
        MAP_POTION: SpriteSupplier;
        MAP_SCROLL: SpriteSupplier;
        MAP_BOW: SpriteSupplier;
        PLAYER: UnitSpriteSupplier;
        GOLEM: UnitSpriteSupplier;
        GRUNT: UnitSpriteSupplier;
        SNAKE: UnitSpriteSupplier;
        SOLDIER: UnitSpriteSupplier;
        ARROW: ProjectileSpriteSupplier;
    };
    export default _default_1;
    export { createStaticSprite };
}
declare module "items/ProjectileFactory" {
    import { Coordinates, Direction, Projectile } from "types/types";
    function createArrow({ x, y }: Coordinates, direction: Direction): Projectile;
    export { createArrow };
}
declare module "graphics/animations/Animations" {
    import Unit from "units/Unit";
    import { Coordinates, Direction } from "types/types";
    function playAttackingAnimation(source: Unit, target: Unit): Promise<any>;
    function playArrowAnimation(source: Unit, direction: Direction, coordinatesList: Coordinates[], target: Unit | null): Promise<any>;
    function playFloorFireAnimation(source: Unit, targets: Unit[]): Promise<any>;
    export { playAttackingAnimation, playArrowAnimation, playFloorFireAnimation };
}
declare module "units/UnitUtils" {
    import Unit from "units/Unit";
    import { Coordinates, Direction } from "types/types";
    function moveOrAttack(unit: Unit, { x, y }: Coordinates): Promise<void>;
    function fireProjectile(unit: Unit, { dx, dy }: Direction): Promise<void>;
    export { moveOrAttack, fireProjectile };
}
declare module "units/UnitBehaviors" {
    import Unit from "units/Unit";
    type UnitBehavior = (unit: Unit) => Promise<void>;
    function _wander(unit: Unit): Promise<void>;
    function _attackPlayerUnit_withPath(unit: Unit): Promise<void>;
    function _fleeFromPlayerUnit(unit: Unit): Promise<void>;
    const UnitBehaviors: {
        WANDER: typeof _wander;
        ATTACK_PLAYER: typeof _attackPlayerUnit_withPath;
        FLEE_FROM_PLAYER: typeof _fleeFromPlayerUnit;
        STAY: () => Promise<any>;
    };
    export default UnitBehaviors;
    export { UnitBehavior };
}
declare module "units/UnitAI" {
    import Unit from "units/Unit";
    /**
     * A UnitAI is anything that an AI-controlled unit can do in a turn.
     * Specifically, it's a combination of UnitBehavior's, chosen based on
     * unit state and random variation.
     */
    type UnitAI = (unit: Unit) => Promise<void>;
    const HUMAN_CAUTIOUS: UnitAI;
    const HUMAN_AGGRESSIVE: UnitAI;
    const HUMAN_DETERMINISTIC: UnitAI;
    export { UnitAI, HUMAN_CAUTIOUS, HUMAN_AGGRESSIVE, HUMAN_DETERMINISTIC };
}
declare module "units/UnitClass" {
    import Unit from "units/Unit";
    import Sprite from "graphics/sprites/Sprite";
    import { PaletteSwaps, UnitType } from "types/types";
    import { UnitAI } from "units/UnitAI";
    interface AIParameters {
        /**
         * between 0 and 1
         */
        speed: number;
        /**
         * whole number of tiles
         */
        visionRange: number;
        /**
         * ratio of (current life / max life)
         */
        fleeThreshold: number;
    }
    interface UnitClass {
        readonly name: string;
        readonly type: UnitType;
        readonly paletteSwaps: PaletteSwaps;
        readonly startingLife: number;
        readonly startingMana: number | null;
        readonly startingDamage: number;
        readonly minLevel: number;
        readonly maxLevel: number;
        readonly lifePerLevel: (level: number) => number;
        readonly manaPerLevel: (level: number) => (number | null);
        readonly damagePerLevel: (level: number) => number;
        readonly experienceToNextLevel?: (level: number) => (number | null);
        readonly aiHandler?: UnitAI;
        readonly sprite: (unit: Unit, paletteSwaps: PaletteSwaps) => Sprite;
        readonly aiParams?: AIParameters;
    }
    export default UnitClass;
}
declare module "items/InventoryItem" {
    import { ItemCategory } from "types/types";
    import Unit from "units/Unit";
    class InventoryItem {
        readonly name: string;
        readonly category: ItemCategory;
        private readonly _onUse;
        constructor(name: string, category: ItemCategory, onUse: (item: InventoryItem, unit: Unit) => Promise<void>);
        use(unit: Unit): Promise<any>;
    }
    export default InventoryItem;
}
declare module "items/InventoryMap" {
    import { ItemCategory } from "types/types";
    import InventoryItem from "items/InventoryItem";
    /**
     * Contains information about all items held by a particular unit, grouped by category,
     * as well as data about the selected item/category in the inventory menu
     * (although this is only applicable to the player unit)
     */
    class InventoryMap {
        private readonly _map;
        selectedCategory: ItemCategory;
        selectedItem: InventoryItem | null;
        constructor();
        add(item: InventoryItem): void;
        remove(item: InventoryItem): void;
        nextCategory(): void;
        previousCategory(): void;
        get(category: ItemCategory): InventoryItem[];
        nextItem(): void;
        previousItem(): void;
    }
    export default InventoryMap;
}
declare module "items/equipment/EquippedItem" {
    import { EquipmentSlot } from "types/types";
    import InventoryItem from "items/InventoryItem";
    class EquippedItem {
        name: string;
        slot: EquipmentSlot;
        inventoryItem: InventoryItem;
        damage: number;
        constructor(name: string, slot: EquipmentSlot, inventoryItem: InventoryItem, damage: number);
    }
    export default EquippedItem;
}
declare module "items/equipment/EquipmentMap" {
    import { EquipmentSlot } from "types/types";
    import EquippedItem from "items/equipment/EquippedItem";
    /**
     * Represent's a unit's equipment, mapped by slot.
     */
    class EquipmentMap {
        private readonly _map;
        constructor();
        add(item: EquippedItem): void;
        remove(item: EquippedItem): void;
        get(category: EquipmentSlot): EquippedItem | null;
        getEntries(): [EquipmentSlot, EquippedItem][];
    }
    export default EquipmentMap;
}
declare module "units/Unit" {
    import { Activity, Coordinates, Direction, Entity } from "types/types";
    import Sprite from "graphics/sprites/Sprite";
    import UnitClass from "units/UnitClass";
    import { UnitAI } from "units/UnitAI";
    import InventoryMap from "items/InventoryMap";
    import EquipmentMap from "items/equipment/EquipmentMap";
    class Unit implements Entity {
        readonly unitClass: UnitClass;
        readonly char = "@";
        readonly sprite: Sprite;
        inventory: InventoryMap;
        equipment: EquipmentMap;
        x: number;
        y: number;
        name: string;
        level: number;
        experience: number;
        life: number;
        maxLife: number;
        mana: number | null;
        maxMana: number | null;
        lifeRemainder: number;
        private _damage;
        queuedOrder: (() => Promise<void>) | null;
        aiHandler?: UnitAI;
        activity: Activity;
        direction: Direction | null;
        constructor(unitClass: UnitClass, name: string, level: number, { x, y }: Coordinates);
        _regenLife(): void;
        update(): Promise<void>;
        getDamage(): number;
        getRangedDamage(): number;
        private _levelUp;
        gainExperience(experience: number): void;
        experienceToNextLevel(): (number | null);
        takeDamage(damage: number, sourceUnit?: (Unit | undefined)): Promise<any>;
    }
    export default Unit;
}
declare module "items/MapItem" {
    import InventoryItem from "items/InventoryItem";
    import Sprite from "graphics/sprites/Sprite";
    import { Coordinates, Entity } from "types/types";
    class MapItem implements Entity {
        x: number;
        y: number;
        readonly char: string;
        readonly sprite: Sprite;
        inventoryItem: InventoryItem;
        constructor({ x, y }: Coordinates, char: string, sprite: Sprite, inventoryItem: InventoryItem);
    }
    export default MapItem;
}
declare module "maps/MapInstance" {
    import Unit from "units/Unit";
    import MapItem from "items/MapItem";
    import { Coordinates, Entity, Rect, Room, Tile } from "types/types";
    class MapInstance {
        width: number;
        height: number;
        /**
         * [y][x]
         */
        private readonly _tiles;
        rooms: Room[];
        units: Unit[];
        items: MapItem[];
        projectiles: Entity[];
        revealedTiles: Coordinates[];
        constructor(width: number, height: number, tiles: Tile[][], rooms: Room[], units: Unit[], items: MapItem[]);
        getTile({ x, y }: Coordinates): Tile;
        getUnit({ x, y }: Coordinates): (Unit | null);
        getItem({ x, y }: Coordinates): (MapItem | null);
        getProjectile({ x, y }: Coordinates): (Entity | null);
        contains({ x, y }: Coordinates): boolean;
        isBlocked({ x, y }: Coordinates): boolean;
        removeUnit({ x, y }: Coordinates): void;
        removeItem({ x, y }: Coordinates): void;
        removeProjectile({ x, y }: Coordinates): void;
        getRect(): Rect;
    }
    export default MapInstance;
}
declare module "maps/MapSupplier" {
    import { Coordinates, Room, Tile } from "types/types";
    import Unit from "units/Unit";
    import MapItem from "items/MapItem";
    import MapInstance from "maps/MapInstance";
    interface MapSupplier {
        level: number;
        width: number;
        height: number;
        tiles: Tile[][];
        rooms: Room[];
        playerUnitLocation: Coordinates;
        enemyUnitLocations: Coordinates[];
        enemyUnitSupplier: ({ x, y }: Coordinates, level: number) => Unit;
        itemLocations: Coordinates[];
        itemSupplier: ({ x, y }: Coordinates, level: number) => MapItem;
    }
    function createMap(mapSupplier: MapSupplier): MapInstance;
    export default MapSupplier;
    export { createMap };
}
declare module "core/GameState" {
    import { GameScreen } from "types/types";
    import Unit from "units/Unit";
    import MapSupplier from "maps/MapSupplier";
    import MapInstance from "maps/MapInstance";
    class GameState {
        screen: GameScreen;
        playerUnit: Unit;
        mapSuppliers: MapSupplier[];
        mapIndex: number | null;
        private _map;
        messages: string[];
        turn: number;
        constructor(playerUnit: Unit, mapSuppliers: MapSupplier[]);
        getMap(): MapInstance;
        setMap(map: MapInstance): void;
    }
    export default GameState;
}
declare module "core/TurnHandler" {
    import Unit from "units/Unit";
    function playTurn(playerUnitOrder: ((unit: Unit) => Promise<void>) | null): Promise<void>;
    const _default_2: {
        playTurn: typeof playTurn;
    };
    export default _default_2;
}
declare module "items/ItemUtils" {
    import Unit from "units/Unit";
    import MapItem from "items/MapItem";
    import InventoryItem from "items/InventoryItem";
    function pickupItem(unit: Unit, mapItem: MapItem): void;
    function useItem(unit: Unit, item: InventoryItem): Promise<any>;
    export { pickupItem, useItem };
}
declare module "graphics/Renderer" {
    abstract class Renderer {
        abstract render(): Promise<any>;
    }
    export default Renderer;
}
declare module "graphics/SpriteRenderer" {
    import Renderer from "graphics/Renderer";
    class SpriteRenderer implements Renderer {
        private readonly _container;
        private readonly _canvas;
        private readonly _context;
        constructor();
        render(): Promise<any>;
        private _renderGameScreen;
        private _renderTiles;
        private _renderItems;
        private _renderProjectiles;
        private _renderUnits;
        /**
         * @param color (in hex form)
         */
        private _drawEllipse;
        private _renderInventory;
        private _isPixelOnScreen;
        private _renderElement;
        private _drawSprite;
        /**
         * Renders the bottom-left area of the screen, showing information about the player
         */
        private _renderPlayerInfo;
        private _renderMessages;
        private _renderBottomBar;
        private _drawRect;
        /**
         * @return the top left pixel
         */
        private _gridToPixel;
    }
    export default SpriteRenderer;
}
declare module "items/equipment/EquipmentClasses" {
    import { EquipmentSlot, ItemCategory, PaletteSwaps, SpriteSupplier } from "types/types";
    interface EquipmentClass {
        name: string;
        itemCategory: ItemCategory;
        equipmentCategory: EquipmentSlot;
        mapIcon: SpriteSupplier;
        char: string;
        paletteSwaps?: PaletteSwaps;
        minLevel: number;
        maxLevel: number;
        damage: number;
    }
    function getWeaponClasses(): EquipmentClass[];
    export { EquipmentClass, getWeaponClasses };
}
declare module "items/ItemFactory" {
    import { Coordinates } from "types/types";
    import MapItem from "items/MapItem";
    function createRandomItem({ x, y }: Coordinates, level: number): MapItem;
    const _default_3: {
        createRandomItem: typeof createRandomItem;
    };
    export default _default_3;
}
declare module "units/UnitClasses" {
    import UnitClass from "units/UnitClass";
    function getEnemyClasses(): UnitClass[];
    const _default_4: {
        PLAYER: UnitClass;
        ENEMY_GRUNT: UnitClass;
        ENEMY_GOLEM: UnitClass;
        getEnemyClasses: typeof getEnemyClasses;
    };
    export default _default_4;
}
declare module "units/UnitFactory" {
    import { Coordinates } from "types/types";
    import Unit from "units/Unit";
    function createRandomEnemy({ x, y }: Coordinates, level: number): Unit;
    const _default_5: {
        createRandomEnemy: typeof createRandomEnemy;
    };
    export default _default_5;
}
declare module "maps/generation/DungeonGenerator" {
    import Unit from "units/Unit";
    import MapSupplier from "maps/MapSupplier";
    import MapItem from "items/MapItem";
    import { Coordinates, MapSection, TileSet } from "types/types";
    abstract class DungeonGenerator {
        protected readonly _tileSet: TileSet;
        protected constructor(tileSet: TileSet);
        generateDungeon(level: number, width: number, height: number, numEnemies: number, enemyUnitSupplier: ({ x, y }: Coordinates, level: number) => Unit, numItems: number, itemSupplier: ({ x, y }: Coordinates, level: number) => MapItem): MapSupplier;
        protected abstract generateTiles(width: number, height: number): MapSection;
        /**
         * Spawn the player at the tile that maximizes average distance from enemies and the level exit.
         */
        private _pickPlayerLocation;
    }
    export default DungeonGenerator;
}
declare module "maps/generation/RoomCorridorDungeonGenerator" {
    import DungeonGenerator from "maps/generation/DungeonGenerator";
    import { MapSection, TileSet } from "types/types";
    /**
     * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
     */
    class RoomCorridorDungeonGenerator extends DungeonGenerator {
        private readonly _minRoomDimension;
        private readonly _maxRoomDimension;
        private readonly _minRoomPadding;
        /**
         * @param minRoomDimension outer width, including wall
         * @param maxRoomDimension outer width, including wall
         * @param minRoomPadding minimum padding between each room and its containing section
         */
        constructor(tileSet: TileSet, minRoomDimension: number, maxRoomDimension: number, minRoomPadding: number);
        protected generateTiles(width: number, height: number): MapSection;
        /**
         * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
         * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
         * not large enough to form two sub-regions, just return a single section.
         */
        private _generateSection;
        /**
         * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
         * anywhere in the region at random, and can occupy a variable amount of space in the region
         * (within the specified parameters).
         */
        private _generateSingleSection;
        private _generateRoomTiles;
        /**
         * @param dimension width or height
         * @returns the min X/Y coordinate of the *second* room
         */
        private _getSplitPoint;
        private _joinSection;
        /**
         * add walls above corridor tiles if possible
         */
        private _addWalls;
        private _canJoinRooms;
        private _joinRooms;
        private _getExitCandidates;
        /**
         * Find a path between the specified exits between rooms.
         */
        private _joinExits;
        private _emptyRow;
        private _coordinatePairEquals;
        private _logSections;
    }
    export default RoomCorridorDungeonGenerator;
}
declare module "maps/generation/BlobDungeonGenerator" {
    import DungeonGenerator from "maps/generation/DungeonGenerator";
    import { MapSection, TileSet } from "types/types";
    class BlobDungeonGenerator extends DungeonGenerator {
        constructor(tileSet: TileSet);
        /**
         * Strategy:
         * Add a floor tile near the middle of the map.
         * Until the map is half-full, continue adding new tiles adjacent to existing tiles.
         * New tile placement should be random - but aim for a certain level of "snakiness",
         * where snakiness is defined as the number of tiles within N units
         * (more adjacent tiles - less snaky).
         */
        protected generateTiles(width: number, height: number): MapSection;
        private _initTiles;
        private _placeInitialTile;
        private _getTargetNumFloorTiles;
        private _getFloorTiles;
        private _getEmptyTiles;
        /**
         * @return whether a tile was successfully added
         */
        private _addFloorTile;
        private _getCandidates;
        private _isLegalWallCoordinates;
        private _hasKittyCornerFloorTile;
        private _addWalls;
        /**
         * @param end inclusive
         */
        private _range;
        /**
         * @return the number of nearby tiles
         */
        private _getSnakeScore;
    }
    export default BlobDungeonGenerator;
}
declare module "maps/MapFactory" {
    import MapSupplier from "maps/MapSupplier";
    import { MapLayout, TileSet } from "types/types";
    function createRandomMap(mapLayout: MapLayout, tileSet: TileSet, level: number, width: number, height: number, numEnemies: number, numItems: number): MapSupplier;
    const _default_6: {
        createRandomMap: typeof createRandomMap;
    };
    export default _default_6;
}
declare module "sounds/Music" {
    import { Sample } from "types/types";
    type Figure = Sample[];
    type Suite = {
        length: number;
        sections: {
            [sectionName: string]: {
                bass?: Figure[];
                lead?: Figure[];
            };
        };
    };
    function playSuite(suite: Suite): void;
    const _default_7: {
        SUITE_1: Suite;
        SUITE_2: Suite;
        SUITE_3: Suite;
        SUITE_4: Suite;
        playSuite: typeof playSuite;
    };
    export default _default_7;
}
declare module "maps/TileSets" {
    import { TileSet } from "types/types";
    const TileSets: {
        DUNGEON: TileSet;
        CAVE: TileSet;
    };
    export default TileSets;
}
declare module "core/actions" {
    function loadMap(index: number): void;
    function restartGame(): Promise<any>;
    /**
     * Add any tiles the player can currently see to the map's revealed tiles list.
     */
    function revealTiles(): void;
    export { loadMap, restartGame, revealTiles, };
}
declare module "core/InputHandler" {
    function keyHandler(e: KeyboardEvent): Promise<void>;
    function attachEvents(): void;
    export { attachEvents, keyHandler as simulateKeyPress };
}
declare module "core/debug" {
    function revealMap(): void;
    function killEnemies(): void;
    export { revealMap, killEnemies };
}
declare module "core/globals" {
    import GameState from "core/GameState";
    import Renderer from "graphics/Renderer";
    global {
        let jwb: {
            state: GameState;
            renderer: Renderer;
            DEBUG: boolean;
        };
    }
}
declare module "core/main" {
    import { revealMap, killEnemies } from "core/debug";
    function init(): void;
    export { init, killEnemies, revealMap, };
}
