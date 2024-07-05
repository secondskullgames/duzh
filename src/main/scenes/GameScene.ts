import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { Engine } from '@main/core/Engine';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { MapController } from '@main/maps/MapController';
import { GameConfig } from '@main/core/GameConfig';
import {
  ArrowKey,
  ClickCommand,
  Key,
  KeyCommand,
  ModifierKey
} from '@lib/input/inputTypes';
import { isArrowKey, isModifierKey, isNumberKey } from '@lib/input/InputUtils';
import Sounds from '@main/sounds/Sounds';
import { isMobileDevice, toggleFullScreen } from '@lib/utils/dom';
import { getDirection } from '@main/input/inputMappers';
import UnitOrder from '@main/units/orders/UnitOrder';
import { AbilityName } from '@main/abilities/AbilityName';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { AbilityOrder } from '@main/units/orders/AbilityOrder';
import { Feature } from '@main/utils/features';
import { Strafe } from '@main/abilities/Strafe';
import { Dash } from '@main/abilities/Dash';
import { AttackMoveBehavior } from '@main/units/behaviors/AttackMoveBehavior';
import PlayerUnitController from '@main/units/controllers/PlayerUnitController';
import { checkNotNull } from '@lib/utils/preconditions';
import { Coordinates } from '@lib/geometry/Coordinates';
import { getItem, getShrine } from '@main/maps/MapUtils';
import { pickupItem } from '@main/actions/pickupItem';
import { TileType } from '@models/TileType';
import { Rect } from '@lib/geometry/Rect';
import TopMenuRenderer, { TopMenuIcon } from '@main/graphics/renderers/TopMenuRenderer';
import { isAdjacent, pointAt } from '@lib/geometry/CoordinatesUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { LINE_HEIGHT, TILE_HEIGHT, TILE_WIDTH } from '@main/graphics/constants';
import Unit from '@main/units/Unit';
import { ShrineOption } from '@main/core/session/ShrineMenuState';
import { TextRenderer } from '@main/graphics/TextRenderer';
import GameScreenViewportRenderer from '@main/graphics/renderers/GameScreenViewportRenderer';
import { Renderer } from '@main/graphics/renderers/Renderer';
import HUDRenderer from '@main/graphics/renderers/HUDRenderer';
import { Graphics } from '@lib/graphics/Graphics';
import Colors from '@main/graphics/Colors';
import { FontName } from '@main/graphics/Fonts';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Color } from '@lib/graphics/Color';
import { inject, injectable } from 'inversify';

@injectable()
export class GameScene implements Scene {
  readonly name = SceneName.GAME;

  constructor(
    @inject(Engine)
    private readonly engine: Engine,
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState,
    @inject(MapController)
    private readonly mapController: MapController,
    @inject(GameConfig)
    private readonly gameConfig: GameConfig,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(GameScreenViewportRenderer)
    private readonly viewportRenderer: Renderer,
    @inject(HUDRenderer)
    private readonly hudRenderer: Renderer,
    @inject(TopMenuRenderer)
    private readonly topMenuRenderer: Renderer
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { state, session, engine } = this;
    const { key, modifiers } = command;

    if (session.isShowingShrineMenu()) {
      await this._handleKeyDownInShrineMenu(command);
      return;
    }

    if (isArrowKey(key)) {
      await this._handleArrowKey(key as ArrowKey, modifiers);
    } else if (isNumberKey(key)) {
      await this._handleAbilityKey(key);
    } else if (isModifierKey(key)) {
      await this._handleModifierKeyDown(key as ModifierKey);
    } else if (key === 'SPACEBAR') {
      state.getSoundPlayer().playSound(Sounds.FOOTSTEP);
      await engine.playTurn();
    } else if (key === 'TAB') {
      session.prepareInventoryScreen(session.getPlayerUnit());
      session.setScene(SceneName.INVENTORY);
    } else if (key === 'M') {
      session.setScene(SceneName.MAP);
    } else if (key === 'C') {
      session.setScene(SceneName.CHARACTER);
    } else if (key === 'ENTER') {
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      } else {
        await this._handleEnter();
      }
    } else if (key === 'F1') {
      session.setScene(SceneName.HELP);
    }
  };

  handleKeyUp = async (command: KeyCommand) => {
    const { key } = command;
    if (isModifierKey(key)) {
      await this._handleModifierKeyUp(key as ModifierKey);
    }
  };

  private _handleArrowKey = async (key: ArrowKey, modifiers: ModifierKey[]) => {
    const { state, session, engine } = this;
    const direction = getDirection(key);
    const playerUnit = session.getPlayerUnit();

    let order: UnitOrder | null = null;
    if (modifiers.includes(ModifierKey.SHIFT)) {
      // TODO need to centralize this logic
      const possibleAbilities = [
        AbilityName.SHOOT_ARROW,
        AbilityName.SHOOT_FIREBOLT,
        AbilityName.SHOOT_FROSTBOLT
      ];
      for (const abilityName of possibleAbilities) {
        if (playerUnit.hasAbility(abilityName)) {
          const ability = UnitAbility.abilityForName(abilityName);
          if (ability.isEnabled(playerUnit)) {
            order = new AbilityOrder({ direction, ability });
          }
        }
      }
    } else if (
      modifiers.includes(ModifierKey.ALT) &&
      Feature.isEnabled(Feature.ALT_STRAFE)
    ) {
      if (Strafe.isEnabled(playerUnit)) {
        order = new AbilityOrder({ direction, ability: Strafe });
      }
    } else if (
      modifiers.includes(ModifierKey.ALT) &&
      Feature.isEnabled(Feature.ALT_DASH)
    ) {
      if (Dash.isEnabled(playerUnit)) {
        order = new AbilityOrder({ direction, ability: Dash });
      }
    } else {
      const ability = session.getQueuedAbility();
      session.setQueuedAbility(null);
      if (ability) {
        order = new AbilityOrder({ ability, direction });
      } else {
        order = new AttackMoveBehavior({ direction }).issueOrder(
          playerUnit,
          state,
          session
        );
      }
    }

    if (order) {
      const playerController = playerUnit.getController() as PlayerUnitController;
      playerController.queueOrder(order);
      await engine.playTurn();
    }
  };

  private _handleAbilityKey = async (hotkey: Key) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    const playerUnitClass = checkNotNull(playerUnit.getPlayerUnitClass());
    const ability = playerUnitClass.getAbilityForHotkey(hotkey, playerUnit);
    if (ability) {
      await this._handleAbility(ability);
    }
  };

  private _handleAbility = async (ability: UnitAbility) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    if (ability.isEnabled(playerUnit)) {
      session.setQueuedAbility(ability);
    }
  };

  private _handleEnter = async () => {
    const { state, session, engine, mapController } = this;
    const map = session.getMap();
    const playerUnit = session.getPlayerUnit();
    const coordinates = playerUnit.getCoordinates();
    const nextCoordinates = Coordinates.plus(coordinates, playerUnit.getDirection());
    const item = getItem(map, coordinates);
    const shrine = map.contains(nextCoordinates) ? getShrine(map, nextCoordinates) : null;
    if (item) {
      pickupItem(playerUnit, item, session, state);
      map.removeObject(item);
    } else if (map.getTile(coordinates).getTileType() === TileType.STAIRS_DOWN) {
      state.getSoundPlayer().playSound(Sounds.DESCEND_STAIRS);
      await mapController.loadNextMap();
    } else if (map.getTile(coordinates).getTileType() === TileType.STAIRS_UP) {
      state.getSoundPlayer().playSound(Sounds.DESCEND_STAIRS); // TODO
      await mapController.loadPreviousMap();
    } else if (shrine) {
      shrine.use(state, session);
    }
    await engine.playTurn();
  };

  private _handleModifierKeyDown = async (key: ModifierKey) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    switch (key) {
      case ModifierKey.SHIFT: {
        for (const abilityName of [
          AbilityName.SHOOT_ARROW,
          // TODO why not SHOOT_FIREBOLT?
          AbilityName.SHOOT_FROSTBOLT
        ]) {
          const ability = UnitAbility.abilityForName(abilityName);
          if (playerUnit.hasAbility(abilityName) && ability?.isEnabled(playerUnit)) {
            session.setQueuedAbility(ability);
          }
        }
        break;
      }
      case ModifierKey.ALT: {
        const ability = UnitAbility.abilityForName(AbilityName.DASH);
        if (ability?.isEnabled(playerUnit)) {
          session.setQueuedAbility(ability);
        }
        break;
      }
    }
  };

  private _handleModifierKeyUp = async (key: ModifierKey) => {
    const { session } = this;
    switch (key) {
      case ModifierKey.SHIFT: {
        const queuedAbility = session.getQueuedAbility();
        if (queuedAbility) {
          // TODO need to centralize this logic
          const possibleAbilities = [
            AbilityName.SHOOT_ARROW,
            AbilityName.SHOOT_FIREBOLT,
            AbilityName.SHOOT_FROSTBOLT
          ];
          if (possibleAbilities.includes(queuedAbility.name)) {
            session.setQueuedAbility(null);
          }
        }
        break;
      }
      case ModifierKey.ALT: {
        if (session.getQueuedAbility()?.name === AbilityName.DASH) {
          session.setQueuedAbility(null);
        }
        break;
      }
    }
  };

  private _handleKeyDownInShrineMenu = async (command: KeyCommand) => {
    const shrineMenuState = checkNotNull(this.session.getShrineMenuState());
    switch (command.key) {
      case 'UP':
        shrineMenuState.selectPreviousOption();
        break;
      case 'DOWN':
        shrineMenuState.selectNextOption();
        break;
      case 'ENTER':
        if (command.modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          const selectedOption = shrineMenuState.getSelectedOption();
          await selectedOption.onUse(this.state);
          this.session.closeShrineMenu();
        }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async ({ pixel }: ClickCommand) => {
    const { session, state } = this;
    // TODO I wish we had a widget library...
    const playerUnit = session.getPlayerUnit();
    const abilityRects = this._getAbilityRects(playerUnit);
    for (const [abilityName, rect] of abilityRects) {
      if (Rect.containsPoint(rect, pixel)) {
        const ability = UnitAbility.abilityForName(abilityName);
        await this._handleAbility(ability);
      }
    }

    const topIcons = TopMenuRenderer.getIconRects();
    for (const { icon, rect } of topIcons) {
      if (Rect.containsPoint(rect, pixel)) {
        switch (icon) {
          case TopMenuIcon.MAP:
            session.setScene(SceneName.MAP);
            return;
          case TopMenuIcon.INVENTORY:
            session.prepareInventoryScreen(session.getPlayerUnit());
            session.setScene(SceneName.INVENTORY);
            return;
          case TopMenuIcon.CHARACTER:
            session.setScene(SceneName.CHARACTER);
            return;
          case TopMenuIcon.HELP:
            session.setScene(SceneName.HELP);
            return;
        }
      }
    }

    if (session.isShowingShrineMenu()) {
      const shrineOptionRects = this._getShrineOptionRects();
      for (const [option, rect] of shrineOptionRects) {
        if (Rect.containsPoint(rect, pixel)) {
          await option.onUse(state);
          session.closeShrineMenu();
        }
      }
    }

    const coordinates = this._pixelToGrid(pixel);

    const playerCoordinates = playerUnit.getCoordinates();
    if (
      !Coordinates.equals(coordinates, playerCoordinates) &&
      !isAdjacent(coordinates, playerCoordinates)
    ) {
      return;
    }
    const { dx, dy } = Coordinates.difference(playerCoordinates, coordinates);
    const key = (() => {
      if (dx === 0 && dy === 0) {
        return 'ENTER';
      }
      // TODO this is so hacky
      if (getShrine(playerUnit.getMap(), coordinates)) {
        playerUnit.setDirection(pointAt(playerUnit.getCoordinates(), coordinates));
        return 'ENTER';
      }
      if (dy === -1 && dx === 0) {
        return 'UP';
      }
      if (dy === 1 && dx === 0) {
        return 'DOWN';
      }
      if (dx === -1 && dy === 0) {
        return 'LEFT';
      }
      if (dx === 1 && dy === 0) {
        return 'RIGHT';
      }
      return null;
    })();
    if (key === 'ENTER') {
      await this._handleEnter();
    } else if (isArrowKey(key)) {
      await this._handleArrowKey(key as ArrowKey, []);
    }
  };

  private _pixelToGrid = ({ x: pixelX, y: pixelY }: Pixel): Coordinates => {
    const playerUnit = this.session.getPlayerUnit();
    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    const { screenWidth, screenHeight } = this.gameConfig;
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
      const rect = {
        left: 173 + 25 * i,
        top: 306,
        width: 20,
        height: 20
      };
      abilityRects.push([numberedAbilities[i].name, rect]);
    }

    for (let i = 0; i < rightAlignedAbilities.length; i++) {
      // TODO muy hardcoding, duplicates logic in HUDRenderer
      const rect = {
        left: 402 + i * 25,
        top: 306,
        width: 20,
        height: 20
      };
      abilityRects.push([rightAlignedAbilities[i].name, rect]);
    }

    return abilityRects;
  };

  private _getShrineOptionRects = (): [ShrineOption, Rect][] => {
    const shrineMenuState = this.session.getShrineMenuState();
    const shrineOptionRects: [ShrineOption, Rect][] = [];
    const { screenWidth, screenHeight } = this.gameConfig;
    for (let i = 0; i < shrineMenuState.options.length; i++) {
      const option = shrineMenuState.options[i];
      const rect = {
        left: screenWidth / 4 + 10,
        top: screenHeight / 4 + 10 + 20 * i,
        width: screenWidth / 2 - 20,
        height: 20
      };
      shrineOptionRects.push([option, rect]);
    }
    return shrineOptionRects;
  };

  render = async (graphics: Graphics) => {
    graphics.fillRect(
      {
        left: 0,
        top: 0,
        width: graphics.getWidth(),
        height: graphics.getHeight()
      },
      Colors.BLACK
    );

    await this.viewportRenderer.render(graphics);
    await this.hudRenderer.render(graphics);
    await this._renderTicker(graphics);

    if (isMobileDevice()) {
      await this.topMenuRenderer.render(graphics);
    }

    if (Feature.isEnabled(Feature.BUSY_INDICATOR)) {
      if (this.session.isTurnInProgress()) {
        this._drawTurnProgressIndicator(graphics);
      }
    }
  };

  private _renderTicker = async (graphics: Graphics) => {
    const { session } = this;
    const messages = session.getTicker().getRecentMessages(session.getTurn());

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + LINE_HEIGHT * i;
      graphics.fillRect(
        { left, top: y, width: graphics.getWidth(), height: LINE_HEIGHT },
        Colors.BLACK
      );
      this._drawText(
        messages[i],
        FontName.APPLE_II,
        { x: left, y: y + 2 },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }
  };

  private _drawTurnProgressIndicator = (graphics: Graphics) => {
    if (this.session.isTurnInProgress()) {
      const width = 20;
      const height = 20;
      const left = graphics.getWidth() - width;
      const top = 0;
      const rect = { left, top, width, height };
      graphics.fillRect(rect, Colors.DARK_GRAY);
    }
  };

  private _drawText = (
    text: string,
    fontName: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics
  ) => {
    const imageData = this.textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}