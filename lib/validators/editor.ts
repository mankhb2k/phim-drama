import { z } from "zod";

export const movieSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  year: z.number().optional(),
  country: z.string().optional(),
  genres: z.array(z.string()).min(1),
  posterUrl: z.string().url().optional(),
});

export const episodeSchema = z.object({
  movieId: z.string(),
  number: z.number().int().positive(),
  language: z.string(),
  sources: z
    .array(
      z.object({
        server: z.string(),
        url: z.string().url(),
      }),
    )
    .min(1),
});
