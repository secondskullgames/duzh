import { Figure, MusicModel, Suite } from '@duzh/models';
import { randChoice } from '@duzh/utils/random';
import { SoundPlayer } from './SoundPlayer.js';
import { transpose8vb } from './utils.js';

/**
 * TODO our object hierarchy is kinda fucked up
 */
export class MusicPlayer {
  private activeMusic: Suite | MusicModel | null = null;

  constructor(private readonly soundPlayer: SoundPlayer) {}

  playSuite = (suite: Suite) => {
    this.activeMusic = suite;
    const sections = Object.values(suite.sections);
    const numRepeats = 4;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const bass = section.bass ? randChoice(section.bass) : null;
      let lead: Figure | null;
      if (section.lead) {
        do {
          lead = randChoice(section.lead);
        } while (lead === bass);
      }

      for (let j = 0; j < numRepeats; j++) {
        setTimeout(
          () => {
            if (this.activeMusic === suite) {
              const figures = [
                ...(bass ? [bass.map(transpose8vb)] : []),
                ...(lead ? [lead] : [])
              ];
              for (const figure of figures) {
                this.playFigure(figure);
              }
            }
          },
          (numRepeats * i + j) * suite.length
        );
      }
    }

    setTimeout(
      () => {
        if (this.activeMusic === suite) {
          this.playSuite(suite);
        }
      },
      sections.length * suite.length * numRepeats
    );
  };

  playMusic = (music: MusicModel) => {
    this.activeMusic = music;
    // TODO making a big assumption here
    const length = music.voices[0].map(sample => sample[1]).reduce((a, b) => a + b);
    for (const voice of music.voices) {
      this.playFigure(voice);
    }

    setTimeout(() => {
      if (this.activeMusic === music) {
        this.playMusic(music);
      }
    }, length);
  };

  playFigure = (figure: Figure) => {
    this.soundPlayer.playSamples(figure, false);
  };

  stop = () => {
    this.soundPlayer.stop();
    this.activeMusic = null;
  };
}
