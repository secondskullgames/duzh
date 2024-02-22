import GeneratedMapModel from '../../schemas/GeneratedMapModel';

export default (): GeneratedMapModel => ({
  levelNumber: 5,
  width: 26,
  height: 24,
  enemies: [
    { id: 'grunt', count: 1 },
    { id: 'goblin_soldier', count: 2 },
    { id: 'red_beetle', count: 1 },
    { id: 'green_blob', count: 1 },
    { id: 'scorpion', count: 1 },
    { id: 'archer', count: 1 },
    { id: 'fire_golem', count: 1 }
  ],
  items: [
    { id: 'life_potion', count: 3 },
    { id: 'floor_fire_scroll', count: 1 }
  ],
  equipment: [
    { id: 'iron_chain_mail', count: 1 },
    { id: 'long_bow', count: 1 }
  ],
  objects: [
    { id: 'health_globe', count: 3 },
    { id: 'mirror', count: 1 }
  ],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});
