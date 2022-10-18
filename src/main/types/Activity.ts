type Activity =
  'STANDING'
| 'WALKING'
| 'ATTACKING'
| 'SHOOTING'
| 'DAMAGED'
| 'BURNED'
| 'VANISHING'
| 'APPEARING';

namespace Activity {
  export const values = (): Activity[] => [
    'STANDING',
    'WALKING',
    'ATTACKING',
    'SHOOTING',
    'DAMAGED',
    'BURNED',
    'VANISHING',
    'APPEARING'
  ];
}

export default Activity;
