import GeneratedMapModel from '../../schemas/GeneratedMapModel';

export default (): GeneratedMapModel => ({
  levelNumber: 2,
  width: 22,
  height: 20,
  enemies: [
    { id: 'green_snake', count: 1 },
    { id: 'red_snake', count: 2 },
    { id: 'grunt', count: 2 }
  ],
  items: [
    { id: 'life_potion', count: 2 },
    { id: 'mana_potion', count: 1 },
    { id: 'floor_fire_scroll', count: 1 }
  ],
  equipment: [{ id: 'short_bow', count: 1 }],
  objects: [{ id: 'health_globe', count: 2 }],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});
