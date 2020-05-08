var Activity;
(function (Activity) {
    Activity["STANDING"] = "STANDING";
    Activity["WALKING"] = "WALKING";
    Activity["ATTACKING"] = "ATTACKING";
    Activity["DAMAGED"] = "DAMAGED";
})(Activity || (Activity = {}));
var EquipmentSlot;
(function (EquipmentSlot) {
    EquipmentSlot["MELEE_WEAPON"] = "MELEE_WEAPON";
    EquipmentSlot["RANGED_WEAPON"] = "RANGED_WEAPON";
    EquipmentSlot["ARMOR"] = "ARMOR";
})(EquipmentSlot || (EquipmentSlot = {}));
var GameScreen;
(function (GameScreen) {
    GameScreen["GAME"] = "GAME";
    GameScreen["INVENTORY"] = "INVENTORY";
    GameScreen["TITLE"] = "TITLE";
    GameScreen["VICTORY"] = "VICTORY";
    GameScreen["GAME_OVER"] = "GAME_OVER";
})(GameScreen || (GameScreen = {}));
var ItemCategory;
(function (ItemCategory) {
    ItemCategory["POTION"] = "POTION";
    ItemCategory["SCROLL"] = "SCROLL";
    ItemCategory["WEAPON"] = "WEAPON";
})(ItemCategory || (ItemCategory = {}));
var MapLayout;
(function (MapLayout) {
    MapLayout["ROOMS_AND_CORRIDORS"] = "ROOMS_AND_CORRIDORS";
    MapLayout["BLOB"] = "BLOB";
})(MapLayout || (MapLayout = {}));
var TileType;
(function (TileType) {
    TileType[TileType["FLOOR"] = 0] = "FLOOR";
    TileType[TileType["FLOOR_HALL"] = 1] = "FLOOR_HALL";
    TileType[TileType["WALL_TOP"] = 2] = "WALL_TOP";
    TileType[TileType["WALL_HALL"] = 3] = "WALL_HALL";
    TileType[TileType["WALL"] = 4] = "WALL";
    TileType[TileType["NONE"] = 5] = "NONE";
    TileType[TileType["STAIRS_DOWN"] = 6] = "STAIRS_DOWN";
})(TileType || (TileType = {}));
var UnitType;
(function (UnitType) {
    UnitType["HUMAN"] = "HUMAN";
    UnitType["ELEMENTAL"] = "ELEMENTAL";
    UnitType["GHOST"] = "GHOST";
    UnitType["GOLEM"] = "GOLEM";
    UnitType["WIZARD"] = "WIZARD";
    UnitType["ANIMAL"] = "ANIMAL";
})(UnitType || (UnitType = {}));
export { Activity, EquipmentSlot, GameScreen, ItemCategory, MapLayout, TileType, UnitType };
//# sourceMappingURL=types.js.map