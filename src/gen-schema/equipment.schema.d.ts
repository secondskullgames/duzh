/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface EquipmentModel {
  blockAmount?: number;
  damage?: number;
  itemCategory: string;
  mapIcon: string;
  name: string;
  paletteSwaps: PaletteSwapsModel;
  script?: string;
  slot: string;
  sprite: string;
}
export interface PaletteSwapsModel {
  /**
   * This interface was referenced by `PaletteSwapsModel`'s JSON-Schema definition
   * via the `patternProperty` "^[A-Z_]+$".
   */
  [k: string]: string;
}
