import PaletteSwaps from '../../graphics/PaletteSwaps';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Projectile from '../Projectile';
import ImageFactory from '../../graphics/images/ImageFactory';

type Props = Readonly<{
  imageFactory: ImageFactory;
  spriteFactory: SpriteFactory;
}>;

const createArrow = async (
  coordinates: Coordinates,
  direction: Direction,
  { spriteFactory }: Props
): Promise<Projectile> => {
  const sprite = await spriteFactory.createProjectileSprite(
    'arrow',
    direction,
    PaletteSwaps.empty()
  );
  return new Projectile({
    coordinates,
    direction,
    sprite
  });
};

const createBolt = async (
  coordinates: Coordinates,
  direction: Direction,
  { imageFactory, spriteFactory }: Props
): Promise<Projectile> => {
  const sprite = await spriteFactory.createProjectileSprite(
    'bolt',
    direction,
    PaletteSwaps.empty()
  );
  return new Projectile({
    coordinates,
    direction,
    sprite
  });
};

export default {
  createArrow,
  createBolt
};
