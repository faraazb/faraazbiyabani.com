import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

export const achievements = ({ image }: SchemaContext) =>
  z.object({
    heading: z.string(),
    achievements: z
      .object({
        title: z.string(),
        description: z.string(),
        logo: image(),
        url: z.string(),
      })
      .array(),
  });

export type Achievements = z.infer<ReturnType<typeof achievements>>;
