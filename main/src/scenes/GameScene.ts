import {
  Coordinates,
  isAdjacent,
  offsetsToDirection,
  Pixel,
  pointAt,
  Rect
} from '@duzh/geometry';
import { Graphics } from '@duzh/graphics';
import { checkNotNull } from '@duzh/utils/preconditions';
import { AbilityName } from '@main/abilities/AbilityName';
import { GameController } from '@main/controllers/GameController';
import { Game } from '@main/core/Game';
import { ShrineMenuState, ShrineOption } from '@main/core/state/ShrineMenuState';
import { TILE_HEIGHT, TILE_WIDTH } from '@main/graphics/constants';
import { GameSceneRenderer } from '@main/graphics/renderers/GameSceneRenderer';
import TopMenuRenderer, { TopMenuIcon } from '@main/graphics/renderers/TopMenuRenderer';
import { arrowKeyToDirection, directionToArrowKey } from '@main/input/inputMappers';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { isArrowKey, isModifierKey, isNumberKey } from '@main/input/InputUtils';
import { getShrine } from '@main/maps/MapUtils';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import Unit from '@main/units/Unit';
import { toggleFullScreen } from '@main/utils/dom';

export class GameScene implements Scene {
  readonly name = SceneName.GAME;

  constructor(
    private readonly game: Game,
    private readonly gameController: GameController,
    private readonly renderer: GameSceneRenderer
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { gameController } = this;
    const { state } = this.game;
    const { key, modifiers } = command;

    if (state.isShowingShrineMenu()) {
      await this._handleKeyDownInShrineMenu(command);
      return;
    }

    if (isArrowKey(key)) {
      const direction = arrowKeyToDirection(key);
      if (modifiers.includes(ModifierKey.SHIFT)) {
        await gameController.handleShiftDirectionAction(direction, this.game);
      } else if (modifiers.includes(ModifierKey.ALT)) {
        await gameController.handleAltDirectionAction(direction, this.game);
      } else {
        await gameController.handleDirectionAction(direction, this.game);
      }
    } else if (isNumberKey(key)) {
      await gameController.handleAbilityKey(key, this.game);
    } else if (isModifierKey(key)) {
      await gameController.handleModifierKeyDown(key as ModifierKey, this.game);
    } else if (key === 'SPACEBAR') {
      await gameController.passTurn(this.game);
    } else if (key === 'TAB') {
      await gameController.showInventoryScene(this.game);
    } else if (key === 'M') {
      await gameController.showMapScene(this.game);
    } else if (key === 'C') {
      await gameController.showCharacterScene(this.game);
    } else if (key === 'ENTER') {
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      } else {
        await this.gameController.handleEnter(this.game);
      }
    } else if (key === 'F1') {
      state.setScene(SceneName.HELP);
    }
  };

  handleKeyUp = async (command: KeyCommand) => {
    const { key } = command;
    if (isModifierKey(key)) {
      await this.gameController.handleModifierKeyUp(key as ModifierKey, this.game);
    }
  };

  private _handleKeyDownInShrineMenu = async (command: KeyCommand) => {
    const { shrineController } = this.game;
    switch (command.key) {
      case 'UP':
        shrineController.selectPreviousOption(this.game);
        break;
      case 'DOWN':
        shrineController.selectNextOption(this.game);
        break;
      case 'ENTER':
        if (command.modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await shrineController.chooseSelectedOption(this.game);
        }
    }
  };

  handleClick = async ({ pixel }: ClickCommand) => {
    const { state, inventoryController } = this.game;
    // TODO I wish we had a widget library...
    const playerUnit = state.getPlayerUnit();
    const abilityRects = this._getAbilityRects(playerUnit);
    for (const [abilityName, rect] of abilityRects) {
      if (Rect.containsPoint(rect, pixel)) {
        const ability = playerUnit.getAbilityForName(abilityName);
        await this.gameController.handleAbility(ability, this.game);
        return;
      }
    }

    const topIcons = TopMenuRenderer.getIconRects();
    for (const { icon, rect } of topIcons) {
      if (Rect.containsPoint(rect, pixel)) {
        switch (icon) {
          case TopMenuIcon.MAP:
            state.setScene(SceneName.MAP);
            return;
          case TopMenuIcon.INVENTORY:
            inventoryController.prepareInventoryScreen(this.game);
            state.setScene(SceneName.INVENTORY);
            return;
          case TopMenuIcon.CHARACTER:
            state.setScene(SceneName.CHARACTER);
            return;
          case TopMenuIcon.HELP:
            state.setScene(SceneName.HELP);
            return;
        }
      }
    }

    if (state.isShowingShrineMenu()) {
      const shrineMenuState = checkNotNull(state.getShrineMenuState());
      const shrineOptionRects = this._getShrineOptionRects(shrineMenuState);
      for (const [option, rect] of shrineOptionRects) {
        if (Rect.containsPoint(rect, pixel)) {
          await option.onUse(this.game);
          state.setShrineMenuState(null);
          return;
        }
      }
      return;
    }

    const coordinates = this._pixelToGrid(pixel);

    const playerCoordinates = playerUnit.getCoordinates();
    const { dx, dy } = Coordinates.difference(playerCoordinates, coordinates);
    const key = (() => {
      if (dx === 0 && dy === 0) {
        return 'ENTER';
      }
      // TODO this is so hacky
      if (
        isAdjacent(coordinates, playerCoordinates) &&
        getShrine(playerUnit.getMap(), coordinates)
      ) {
        playerUnit.setDirection(pointAt(playerUnit.getCoordinates(), coordinates));
        return 'ENTER';
      }
      const direction = offsetsToDirection({ dx, dy });
      return directionToArrowKey(direction);
    })();

    if (key === 'ENTER') {
      await this.gameController.handleEnter(this.game);
    } else if (isArrowKey(key)) {
      const direction = arrowKeyToDirection(key);
      await this.gameController.handleDirectionAction(direction, this.game);
    }
  };

  private _pixelToGrid = ({ x: pixelX, y: pixelY }: Pixel): Coordinates => {
    const { state, config } = this.game;
    const playerUnit = state.getPlayerUnit();
    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    const { screenWidth, screenHeight } = config;
    return {
      x: Math.floor((pixelX - (screenWidth - TILE_WIDTH) / 2) / TILE_WIDTH + playerX),
      y: Math.floor((pixelY - (screenHeight - TILE_HEIGHT) / 2) / TILE_HEIGHT + playerY)
    };
  };

  /**
   * TODO this is where I wish we had a widget library...
   */
  private _getAbilityRects = (playerUnit: Unit): [AbilityName, Rect][] => {
    const numberedAbilities =
      playerUnit.getPlayerUnitClass()?.getNumberedAbilities(playerUnit) ?? [];
    const rightAlignedAbilities =
      playerUnit.getPlayerUnitClass()?.getRightAlignedAbilities(playerUnit) ?? [];
    const abilityRects: [AbilityName, Rect][] = [];

    for (let i = 0; i < numberedAbilities.length; i++) {
      // TODO muy hardcoding, duplicates logic in HUDRenderer
      // has a bit of extra padding
      const rect = {
        left: 173 + 25 * i - 2,
        top: 306,
        width: 25,
        height: 50
      };
      abilityRects.push([numberedAbilities[i].name, rect]);
    }

    for (let i = 0; i < rightAlignedAbilities.length; i++) {
      // TODO muy hardcoding, duplicates logic in HUDRenderer
      // has a bit of extra padding
      const rect = {
        left: 402 + i * 25 - 2,
        top: 306,
        width: 25,
        height: 50
      };
      abilityRects.push([rightAlignedAbilities[i].name, rect]);
    }

    return abilityRects;
  };

  private _getShrineOptionRects = (
    shrineMenuState: ShrineMenuState
  ): [ShrineOption, Rect][] => {
    const { config } = this.game;
    const shrineOptionRects: [ShrineOption, Rect][] = [];
    const { screenWidth, screenHeight } = config;
    for (let i = 0; i < shrineMenuState.options.length; i++) {
      const option = shrineMenuState.options[i];
      const rect = {
        left: screenWidth / 4 + 20,
        top: screenHeight / 4 + 70 + 20 * i,
        width: screenWidth / 2 - 20,
        height: 20
      };
      shrineOptionRects.push([option, rect]);
    }
    return shrineOptionRects;
  };

  render = async (graphics: Graphics) => {
    await this.renderer.render(graphics);
  };
}
