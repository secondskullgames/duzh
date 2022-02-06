enum Activity {
  STANDING = 'STANDING',
  WALKING = 'WALKING',
  ATTACKING = 'ATTACKING',
  SHOOTING = 'SHOOTING',
  DAMAGED = 'DAMAGED'
}

namespace Activity {
  export const values = (): Activity[] => [
    Activity.STANDING,
    Activity.WALKING,
    Activity.ATTACKING,
    Activity.SHOOTING
  ];
}

export default Activity;
