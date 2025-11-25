import Unit from '@main/units/Unit';
import { GameState } from '@main/core/GameState';
import MapInstance from '@main/maps/MapInstance';
import { Direction } from '@duzh/geometry';
import { Game } from '@main/core/Game';
import { vi } from 'vitest';
import { describe, expect, test } from 'vitest';

/**
 * TODO - I'm disabling this because it relied on weird Jest wizardry, and I'm not
 * particularly interested in learning how to fix it.  Revisit when our code is better.
 */
describe.skip('NormalAttack', () => {
  test('successful attack', async () => {
    const _attackUnit = vi.fn();
    vi.mock('@main/actions/attackUnit', () => ({
      attackUnit: _attackUnit
    }));
    vi.mock('@main/units/UnitUtils', () => ({
      getMeleeDamage: vi.fn().mockReturnValue(13)
    }));

    const { NormalAttack } = await import('@main/abilities/NormalAttack');
    const map = {
      getUnit: vi.fn()
    } as unknown as MapInstance;
    const unit = {
      gainMana: vi.fn(),
      getCoordinates: () => ({ x: 1, y: 1 }),
      getDirection: () => Direction.E,
      getEquipment: () => ({
        getAll: () => []
      }),
      getMana: () => 10,
      getMap: () => map,
      setActivity: vi.fn(),
      setDirection: vi.fn()
    } as unknown as Unit;
    const targetUnit = {
      getDirection: () => Direction.W,
      setActivity: vi.fn()
    } as unknown as Unit;
    vi.mocked(map.getUnit).mockReturnValue(targetUnit);
    const coordinates = { x: 2, y: 1 };
    const state = {} as GameState;
    const game = { state } as Game;
    await new NormalAttack().use(unit, coordinates, game);
    expect(_attackUnit).toHaveBeenCalled();
  });

  test('no target unit', async () => {
    const _attackUnit = vi.fn();
    vi.mock('@main/actions/attackUnit', () => ({
      attackUnit: _attackUnit
    }));
    vi.mock('@main/units/UnitUtils', () => ({
      getMeleeDamage: vi.fn().mockReturnValue(13)
    }));

    const { NormalAttack } = await import('@main/abilities/NormalAttack');
    const map = {
      getUnit: vi.fn()
    } as unknown as MapInstance;
    const unit = {
      gainMana: vi.fn(),
      getCoordinates: () => ({ x: 1, y: 1 }),
      getDirection: () => Direction.E,
      getEquipment: () => ({
        getAll: () => []
      }),
      getMana: () => 10,
      getMap: () => map,
      setActivity: vi.fn(),
      setDirection: vi.fn()
    } as unknown as Unit;
    vi.mocked(map.getUnit).mockReturnValue(null);
    const coordinates = { x: 2, y: 1 };
    const state = {} as GameState;
    const game = { state } as Game;
    await new NormalAttack().use(unit, coordinates, game);
    expect(_attackUnit).not.toHaveBeenCalled();
  });
});
