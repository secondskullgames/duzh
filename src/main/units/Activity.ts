export enum Activity {
  STANDING = 'STANDING',
  WALKING = 'WALKING',
  ATTACKING = 'ATTACKING',
  SHOOTING = 'SHOOTING',
  VANISHING = 'VANISHING',
  APPEARING = 'APPEARING'
}

export namespace Activity {
  export const values = (): Activity[] => [
    Activity.STANDING,
    Activity.WALKING,
    Activity.ATTACKING,
    Activity.SHOOTING,
    Activity.VANISHING,
    Activity.APPEARING
  ];

  export const toString = (activity: Activity) => activity.toLowerCase();
}

export default Activity;
