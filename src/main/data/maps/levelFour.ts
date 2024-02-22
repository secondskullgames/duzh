import GeneratedMapModel from '../../schemas/GeneratedMapModel';

export default (): GeneratedMapModel => ({
  levelNumber: 4,
  width: 24,
  height: 24,
  enemies: [
    { id: 'grunt', count: 2 },
    { id: 'goblin_soldier', count: 2 },
    { id: 'red_beetle', count: 1 },
    { id: 'green_blob', count: 1 }
  ],
  items: [{ id: 'life_potion', count: 3 }],
  equipment: [
    { id: 'iron_sword', count: 1 },
    { id: 'iron_shield', count: 1 }
  ],
  objects: [{ id: 'health_globe', count: 3 }],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});
