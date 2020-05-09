import SoundPlayer from './SoundPlayer';
import { randChoice } from '../utils/RandomUtils';
import { transpose8vb } from './AudioUtils';
import { Figure, Sample, Suite } from './types';

// TODO very hacky memoizing
let PLAYER: SoundPlayer | null = null;

let ACTIVE_SUITE: Suite | null = null;

const _getMusicPlayer = () => new SoundPlayer(4, 0.12);

function playSuite(suite: Suite) {
  ACTIVE_SUITE = suite;
  const sections = Object.values(suite.sections);
  const numRepeats = 4;
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];
    const bass = (!!section.bass) ? randChoice(section.bass) : null;
    let lead: Figure | null;
    if (!!section.lead) {
      do {
        lead = randChoice(section.lead);
      } while (lead === bass);
    }

    for (let j = 0; j < numRepeats; j++) {
      setTimeout(() => {
        if (suite === ACTIVE_SUITE) {
          const figures = [
            ...(!!bass ? [bass.map(transpose8vb)] : []),
            ...(!!lead ? [lead] : [])
          ];
          figures.forEach(figure => playMusic(figure));
        }
      }, ((numRepeats * i) + j) * suite.length);
    }
  }
  setTimeout(
    () => {
      if (suite === ACTIVE_SUITE) {
        playSuite(suite);
      }
    },
    sections.length * suite.length * numRepeats
  );
}

function playMusic(samples: Sample[]) {
  if (!PLAYER) {
    PLAYER = _getMusicPlayer();
  }
  PLAYER.playSound(samples, false);
}

function stopMusic() {
  if (PLAYER) {
    PLAYER.stop();
  }
}

function stop() {
  stopMusic();
  ACTIVE_SUITE = null;
}

export default {
  playSuite,
  stop
};
