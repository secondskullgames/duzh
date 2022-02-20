type ItemCategory =
  'ARMOR'
| 'KEY'
| 'POTION'
| 'SCROLL'
| 'WEAPON';

namespace ItemCategory {
  export const values = (): ItemCategory[] => ['ARMOR', 'KEY', 'POTION', 'SCROLL', 'WEAPON'];
}

export default ItemCategory;
