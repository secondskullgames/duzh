import Coordinates from '../geometry/Coordinates';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import UnitClass from '../units/UnitClass';
import Spawner from './Spawner';

type SpawnerClass = 'mirror';

const createMirror = async ({ x, y }: Coordinates): Promise<Spawner> => {
  const unitClass = await UnitClass.load('shade');
  const sprite = await SpriteFactory.createMirrorSprite();
  const spawner = new Spawner({
    unitClass,
    sprite,
    maxUnits: 10,
    cooldown: 5,
    x,
    y,
    isBlocking: true
  });
  sprite.target = spawner;
  return spawner;
};

const createSpawner = async ({ x, y }: Coordinates, type: SpawnerClass): Promise<Spawner> => {
  switch (type) {
    case 'mirror': return createMirror({ x, y });
    default: throw new Error(`Unknown spawner type: ${type}`);
  }
};

export default {
  createSpawner
};

export { SpawnerClass };
