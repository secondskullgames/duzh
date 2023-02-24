import { FontDefinition } from './FontRenderer';

const Fonts: Record<string, FontDefinition> = {
  PERFECT_DOS_VGA: {
    name: 'PERFECT_DOS_VGA',
    src: 'dos_perfect_vga_9x15_2',
    letterWidth: 9,
    letterHeight: 15
  },
  PRESS_START_2P: {
    name: 'PRESS_START_2P',
    src: 'press_start_2p_8x9',
    letterWidth: 8,
    letterHeight: 9
  },
  APPLE_II: {
    name: 'APPLE_II',
    src: 'apple_ii_9x9',
    letterWidth: 9,
    letterHeight: 9
  }
};

export default Fonts;