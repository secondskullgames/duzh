import Coordinates from '../geometry/Coordinates';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Spawner from './Spawner';

type SpawnerClass = 'mirror';

const createMirror = async ({ x, y }: Coordinates): Promise<Spawner> => {
  const sprite = await SpriteFactory.createMirrorSprite();
  const spawner = new Spawner({
    unitClass: 'shade',
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
