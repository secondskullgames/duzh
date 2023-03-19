/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only intended for debugging purposes.
 */

import { subtract } from '../utils/arrays';
import { GameEngine } from './GameEngine';
import GameState from './GameState';

type Props = Readonly<{
  engine: GameEngine,
  state: GameState
}>;

export class Debug {
  private readonly engine: GameEngine;
  private readonly state: GameState;
  private revealMap: boolean;

  constructor({ engine, state }: Props) {
    this.engine = engine;
    this.state = state;
    this.revealMap = false;
  }

  toggleRevealMap = async () => {
    this.revealMap = !this.revealMap;
    await this.engine.render();
  };

  isMapRevealed = () => this.revealMap;

  killEnemies = async () => {
    const { state } = this;
    const map = state.getMap();
    const playerUnit = state.getPlayerUnit();
    for (const unit of map.getAllUnits()) {
      if (unit !== playerUnit) {
        map.removeUnit(unit);
      }
    }
    await this.engine.render();
  };

  killPlayer = async () => {
    const playerUnit = this.state.getPlayerUnit();
    await this.engine.dealDamage(playerUnit.getMaxLife(), {
      targetUnit: playerUnit
    })
    await this.engine.render();
  };

  nextLevel = async () => {
    await this.engine.loadNextMap();
    await this.engine.render();
  };

  levelUp = async () => {
    const playerUnit = this.state.getPlayerUnit();
    playerUnit.levelUp();
    await this.engine.render();
  };

  attachToWindow = () => {
    // @ts-ignore
    window.jwb = window.jwb ?? {};
    // @ts-ignore
    window.jwb.debug = this;
  };
}
