import { AbilityName } from './AbilityName';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';

/**
 * Currently, a UnitAbility can really be one of three things:
 * 1. A player ability that shows up on the action bar like Heavy Attack
 *    (or an NPC-only ability like Teleport)
 * 2. An effect from a scroll (like Floor Fire)
 * 3. An effect from an item (like the Bolt Sword effect)
 *
 * Arguably we should decouple these
 */
export interface UnitAbility {
  readonly name: AbilityName;
  readonly manaCost: number;
  readonly icon: string | null;
  /**
   * True if the ability does not show up on the player's action bar
   */
  readonly innate: boolean;

  isEnabled: (unit: Unit) => boolean;

  use: (unit: Unit, coordinates: Coordinates) => Promise<void>;
}
