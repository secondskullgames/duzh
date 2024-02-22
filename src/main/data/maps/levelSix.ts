import GeneratedMapModel from '../../schemas/GeneratedMapModel';

export default (): GeneratedMapModel => ({
  levelNumber: 6,
  width: 28,
  height: 24,
  enemies: [
    { id: 'goblin_soldier', count: 2 },
    { id: 'red_beetle', count: 1 },
    { id: 'green_blob', count: 1 },
    { id: 'scorpion', count: 1 },
    { id: 'fire_golem', count: 2 },
    { id: 'golem', count: 2 }
  ],
  items: [
    { id: 'life_potion', count: 3 },
    { id: 'floor_fire_scroll', count: 1 }
  ],
  equipment: [{ id: 'steel_sword', count: 1 }],
  objects: [{ id: 'health_globe', count: 3 }],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});
