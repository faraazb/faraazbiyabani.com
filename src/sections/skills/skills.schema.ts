import { z } from "astro/zod";
import { ZodIcons } from "src/types";

export const skills = z.object({
  heading: z.string(),
  skills: z
    .object({
      title: z.string(),
      icon: ZodIcons,
      mono: z.boolean().optional(),
    })
    .array(),
});

export type Skills = z.infer<typeof skills>;
