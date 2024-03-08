export type FogOfWarParams = Readonly<{
  enabled: boolean;
  radius?: number;
  spawnEnemies?: boolean;
  spawnedUnitClass?: string;
  spawnRate?: number;
  maxSpawnedUnits?: number;
}>;
