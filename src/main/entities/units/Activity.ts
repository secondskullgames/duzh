export enum Activity {
  STANDING = 'STANDING',
  WALKING = 'WALKING',
  ATTACKING = 'ATTACKING',
  SHOOTING = 'SHOOTING',
  DAMAGED = 'DAMAGED',
  BURNED = 'BURNED',
  VANISHING = 'VANISHING',
  APPEARING = 'APPEARING'
}

export namespace Activity {
  export const values = (): Activity[] => [
    Activity.STANDING,
    Activity.WALKING,
    Activity.ATTACKING,
    Activity.SHOOTING,
    Activity.DAMAGED,
    Activity.BURNED,
    Activity.VANISHING,
    Activity.APPEARING
  ];

  export const toString = (activity: Activity) => activity.toLowerCase();
}

export default Activity;
