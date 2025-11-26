import { ConsumableItemModel, DoorDirection, EquipmentModel } from '@duzh/models';

/** TODO: really need to clean up data representation of other object types */
export type ObjectTemplate =
  | Readonly<{ type: 'door'; direction: DoorDirection; locked: boolean }>
  | Readonly<{ type: 'spawner' }>
  | Readonly<{ type: 'movable_block' }>
  | Readonly<{ type: 'vines' }>
  | Readonly<{ type: 'mirror' }>
  | Readonly<{ type: 'shrine' }>
  | Readonly<{ type: 'item'; model: ConsumableItemModel }>
  | Readonly<{ type: 'equipment'; model: EquipmentModel }>;

export type ObjectType = ObjectTemplate['type'];
export type ItemOrEquipment = ObjectTemplate & { type: 'item' | 'equipment' };
