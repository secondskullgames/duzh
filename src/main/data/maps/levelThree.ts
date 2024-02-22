import GeneratedMapModel from '../../schemas/GeneratedMapModel';

export default (): GeneratedMapModel => ({
  levelNumber: 3,
  width: 24,
  height: 22,
  enemies: [
    { id: 'red_snake', count: 1 },
    { id: 'grunt', count: 2 },
    { id: 'goblin_soldier', count: 2 }
  ],
  items: [{ id: 'life_potion', count: 3 }],
  equipment: [{ id: 'bronze_chain_mail', count: 1 }],
  objects: [{ id: 'health_globe', count: 2 }],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});
