import { z } from 'zod';

/** frequency (Hz), duration (ms) */
export const Sample = z.array(z.number()).length(2);

export type Sample = z.infer<typeof Sample>;

export const Figure = z.array(Sample);
export type Figure = z.infer<typeof Figure>;

export const MusicModel = z.object({
  id: z.string(),
  voices: z.array(Figure)
});
export type MusicModel = z.infer<typeof MusicModel>;

export const SoundEffect = z.object({
  id: z.string(),
  samples: z.array(Sample)
});
export type SoundEffect = z.infer<typeof SoundEffect>;

export const Suite = z.object({
  length: z.number(),
  sections: z.record(
    z.string(),
    z.object({
      bass: z.array(Figure).optional(),
      lead: z.array(Figure).optional()
    })
  )
});

export type Suite = z.infer<typeof Suite>;
