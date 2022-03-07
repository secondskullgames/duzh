type Activity =
  'STANDING'
| 'WALKING'
| 'ATTACKING'
| 'SHOOTING'
| 'DAMAGED'
| 'VANISHING'
| 'APPEARING';

namespace Activity {
  export const values = (): Activity[] => [
    'STANDING',
    'WALKING',
    'ATTACKING',
    'SHOOTING',
    'DAMAGED',
    'VANISHING',
    'APPEARING'
  ];
}

export default Activity;
