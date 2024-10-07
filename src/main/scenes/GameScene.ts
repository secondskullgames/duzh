import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { MapController } from '@main/maps/MapController';
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
import { UnitOrder } from '@main/units/orders/UnitOrder';
import { AbilityName } from '@main/abilities/AbilityName';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { AbilityOrder } from '@main/units/orders/AbilityOrder';
import { Feature } from '@main/utils/features';
import PlayerUnitController from '@main/units/controllers/PlayerUnitController';
import { checkNotNull } from '@lib/utils/preconditions';
import { Coordinates } from '@lib/geometry/Coordinates';
import { getItem, getShrine } from '@main/maps/MapUtils';
import { pickupItem } from '@main/actions/pickupItem';
import { TileType } from '@models/TileType';
import { Rect } from '@lib/geometry/Rect';
import TopMenuRenderer, { TopMenuIcon } from '@main/graphics/renderers/TopMenuRenderer';
import { isAdjacent, offsetsToDirection, pointAt } from '@lib/geometry/CoordinatesUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { LINE_HEIGHT, TILE_HEIGHT, TILE_WIDTH } from '@main/graphics/constants';
import Unit from '@main/units/Unit';
import { ShrineOption } from '@main/core/session/ShrineMenuState';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Renderer } from '@main/graphics/renderers/Renderer';
import { Graphics } from '@lib/graphics/Graphics';
import Colors from '@main/graphics/Colors';
import { FontName } from '@main/graphics/Fonts';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Color } from '@lib/graphics/Color';
import { Direction } from '@lib/geometry/Direction';
import { getMoveOrAttackOrder } from '@main/actions/getMoveOrAttackOrder';
import SoundPlayer from '@lib/audio/SoundPlayer';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';
import GameScreenViewportRenderer from '@main/graphics/renderers/GameScreenViewportRenderer';
import HUDRenderer from '@main/graphics/renderers/HUDRenderer';

@injectable()
export class GameScene implements Scene {
  readonly name = SceneName.GAME;

  constructor(
    @inject(Game)
    private readonly game: Game,
    @inject(MapController)
    private readonly mapController: MapController,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(GameScreenViewportRenderer)
    private readonly viewportRenderer: Renderer,
    @inject(HUDRenderer)
    private readonly hudRenderer: Renderer,
    @inject(TopMenuRenderer)
    private readonly topMenuRenderer: Renderer,
    @inject(SoundPlayer)
    private readonly soundPlayer: SoundPlayer
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { session } = this.game;
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
      this.soundPlayer.playSound(Sounds.FOOTSTEP);
      await this.game.engine.playTurn(this.game);
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
    const { session } = this.game;
    const playerUnit = session.getPlayerUnit();
    const direction = getDirection(key);
    const coordinates = Coordinates.plusDirection(playerUnit.getCoordinates(), direction);

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
          const ability = playerUnit.getAbilityForName(abilityName);
          const coordinates = Coordinates.plusDirection(
            playerUnit.getCoordinates(),
            direction
          );
          if (ability.isEnabled(playerUnit) && ability.isLegal(playerUnit, coordinates)) {
            order = AbilityOrder.create({ direction, ability });
          }
        }
      }
    } else if (
      modifiers.includes(ModifierKey.ALT) &&
      Feature.isEnabled(Feature.ALT_STRAFE)
    ) {
      if (playerUnit.hasAbility(AbilityName.STRAFE)) {
        const ability = playerUnit.getAbilityForName(AbilityName.STRAFE);
        if (ability.isEnabled(playerUnit) && ability.isLegal(playerUnit, coordinates)) {
          order = AbilityOrder.create({ direction, ability });
        }
      }
    } else if (
      modifiers.includes(ModifierKey.ALT) &&
      Feature.isEnabled(Feature.ALT_DASH)
    ) {
      if (playerUnit.hasAbility(AbilityName.DASH)) {
        const ability = playerUnit.getAbilityForName(AbilityName.DASH);
        if (ability.isEnabled(playerUnit) && ability.isLegal(playerUnit, coordinates)) {
          order = AbilityOrder.create({ direction, ability });
        }
      }
    } else {
      const ability = session.getQueuedAbility();
      session.setQueuedAbility(null);
      if (ability) {
        if (ability.isEnabled(playerUnit) && ability.isLegal(playerUnit, coordinates)) {
          order = AbilityOrder.create({ ability, direction });
        }
      } else {
        order = getMoveOrAttackOrder(playerUnit, direction);
      }
    }

    if (order) {
      const playerController = playerUnit.getController() as PlayerUnitController;
      playerController.queueOrder(order);
      await this.game.engine.playTurn(this.game);
    } else {
      playerUnit.setDirection(direction);
      this.soundPlayer.playSound(Sounds.BLOCKED);
    }
  };

  private _handleAbilityKey = async (hotkey: Key) => {
    const { session } = this.game;
    const playerUnit = session.getPlayerUnit();
    const playerUnitClass = checkNotNull(playerUnit.getPlayerUnitClass());
    const ability = playerUnitClass.getAbilityForHotkey(hotkey, playerUnit);
    if (ability) {
      await this._handleAbility(ability);
    }
  };

  private _handleAbility = async (ability: UnitAbility) => {
    const { session } = this.game;
    const playerUnit = session.getPlayerUnit();
    if (ability.isEnabled(playerUnit)) {
      if (session.getQueuedAbility() === ability) {
        session.setQueuedAbility(null);
      } else {
        session.setQueuedAbility(ability);
      }
    }
  };

  private _handleEnter = async () => {
    const { mapController } = this;
    const { state, session } = this.game;
    const map = session.getMap();
    const playerUnit = session.getPlayerUnit();
    const coordinates = playerUnit.getCoordinates();
    const nextCoordinates = Coordinates.plusDirection(
      coordinates,
      playerUnit.getDirection()
    );
    const item = getItem(map, coordinates);
    const shrine = map.contains(nextCoordinates) ? getShrine(map, nextCoordinates) : null;
    if (item) {
      pickupItem(playerUnit, item, session, state);
      map.removeObject(item);
      await this.game.engine.playTurn(this.game);
    } else if (map.getTile(coordinates).getTileType() === TileType.STAIRS_DOWN) {
      this.soundPlayer.playSound(Sounds.DESCEND_STAIRS);
      await mapController.loadNextMap();
    } else if (map.getTile(coordinates).getTileType() === TileType.STAIRS_UP) {
      this.soundPlayer.playSound(Sounds.DESCEND_STAIRS); // TODO
      await mapController.loadPreviousMap();
    } else if (shrine) {
      shrine.use(state, session);
    } else {
      // this is mostly a hack to support clicks
      this.soundPlayer.playSound(Sounds.FOOTSTEP);
      await this.game.engine.playTurn(this.game);
    }
  };

  private _handleModifierKeyDown = async (key: ModifierKey) => {
    const { session } = this.game;
    const playerUnit = session.getPlayerUnit();
    switch (key) {
      case ModifierKey.SHIFT: {
        for (const abilityName of [
          AbilityName.SHOOT_ARROW,
          // TODO why not SHOOT_FIREBOLT?
          AbilityName.SHOOT_FROSTBOLT
        ]) {
          if (playerUnit.hasAbility(abilityName)) {
            const ability = playerUnit.getAbilityForName(abilityName);
            if (ability?.isEnabled(playerUnit)) {
              session.setQueuedAbility(ability);
            }
          }
        }
        break;
      }
      case ModifierKey.ALT: {
        const ability = playerUnit.getAbilityForName(AbilityName.DASH);
        if (ability?.isEnabled(playerUnit)) {
          session.setQueuedAbility(ability);
        }
        break;
      }
    }
  };

  private _handleModifierKeyUp = async (key: ModifierKey) => {
    const { session } = this.game;
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
    const { state, session } = this.game;
    const shrineMenuState = checkNotNull(session.getShrineMenuState());
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
          await selectedOption.onUse(state);
          session.closeShrineMenu();
        }
    }
  };

  handleClick = async ({ pixel }: ClickCommand) => {
    const { state, session } = this.game;
    // TODO I wish we had a widget library...
    const playerUnit = session.getPlayerUnit();
    const abilityRects = this._getAbilityRects(playerUnit);
    for (const [abilityName, rect] of abilityRects) {
      if (Rect.containsPoint(rect, pixel)) {
        const ability = playerUnit.getAbilityForName(abilityName);
        await this._handleAbility(ability);
        return;
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
      switch (direction) {
        case Direction.N:
          return 'UP';
        case Direction.S:
          return 'DOWN';
        case Direction.W:
          return 'LEFT';
        case Direction.E:
          return 'RIGHT';
      }
    })();
    if (key === 'ENTER') {
      await this._handleEnter();
    } else if (isArrowKey(key)) {
      await this._handleArrowKey(key as ArrowKey, []);
    }
  };

  private _pixelToGrid = ({ x: pixelX, y: pixelY }: Pixel): Coordinates => {
    const { session, config } = this.game;
    const playerUnit = session.getPlayerUnit();
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

  private _getShrineOptionRects = (): [ShrineOption, Rect][] => {
    const { session, config } = this.game;
    const shrineMenuState = session.getShrineMenuState();
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
    const { session } = this.game;
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
      if (session.isTurnInProgress()) {
        this._drawTurnProgressIndicator(graphics);
      }
    }
  };

  private _renderTicker = async (graphics: Graphics) => {
    const { session } = this.game;
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
    const { session } = this.game;
    if (session.isTurnInProgress()) {
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
