import GeneratedMapModel from '../../schemas/GeneratedMapModel';
import { randInt } from '../../utils/random';

export default (): GeneratedMapModel => {
  const numEnemies = 5;
  const numRedSnakes = randInt(1, 4);
  const numGreenSnakes = numEnemies - numRedSnakes;
  return {
    levelNumber: 1,
    width: 22,
    height: 18,
    enemies: [
      { id: 'red_snake', count: numRedSnakes },
      { id: 'green_snake', count: numGreenSnakes }
    ],
    items: [{ id: 'life_potion', count: 2 }],
    equipment: [{ id: 'bronze_sword', count: 1 }],
    objects: [{ id: 'health_globe', count: 2 }],
    fogOfWar: {
      enabled: true,
      radius: 3
    }
  };
};
