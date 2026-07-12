import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

export const about = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    bio: z.string(),
    picture: z.object({
      src: image(),
      alt: z.string(),
    }),
    links: z
      .object({
        title: z.string(),
        url: z.string(),
        icon: z.string(),
      })
      .array(),
  });

export type About = z.infer<ReturnType<typeof about>>;
