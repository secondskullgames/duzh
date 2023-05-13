import UnitOrder, { type OrderContext } from './UnitOrder';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { UnitAbility} from '../abilities/UnitAbility';
import { pointAt } from '../../../utils/geometry';
import { walk } from '../../../actions/walk';
import { openDoor } from '../../../actions/openDoor';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { SpawnerState } from '../../objects/Spawner';
import { ObjectType } from '../../objects/GameObject';
import Block from '../../objects/Block';
import { pushBlock } from '../../../actions/pushBlock';

type Props = Readonly<{
  coordinates: Coordinates,
  ability: UnitAbility
}>;

export class AttackMoveOrder implements UnitOrder {
  private readonly coordinates: Coordinates;
  private readonly ability: UnitAbility;

  constructor({ coordinates, ability }: Props) {
    this.coordinates = coordinates;
    this.ability = ability;
  }

  /**
   * @override {@link UnitOrder#execute}
   */
  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: OrderContext
  ): Promise<void> => {
    const { coordinates, ability } = this;
    const map = state.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        await walk(unit, direction, { state, renderer, imageFactory });
        return;
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          await ability.use(unit, coordinates, { state, renderer, imageFactory });
          return;
        }
        const door = map.getDoor(coordinates);
        if (door) {
          await openDoor(unit, door);
          return;
        }

        const spawner = map.getSpawner(coordinates);
        if (spawner && spawner.isBlocking()) {
          playSound(Sounds.SPECIAL_ATTACK);
          const animation = AnimationFactory.getAttackingAnimation(
            unit,
            null,
            { state, imageFactory }
          );
          await playAnimation(
            animation,
            { state, renderer }
          );
          spawner.setState(SpawnerState.DEAD);
          return;
        }

        const block = map.getObjects(coordinates)
          .filter(object => object.getObjectType() === ObjectType.BLOCK)
          .map(object => object as Block)
          .find(block => block.isMovable());

        if (block) {
          await pushBlock(unit, block, { state, renderer, imageFactory });
          return;
        }
      }
    }
  }
}