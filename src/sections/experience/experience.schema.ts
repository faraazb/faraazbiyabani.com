import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

export const experience = ({ image }: SchemaContext) =>
  z.object({
    heading: z.string(),
    experiences: z
      .object({
        company: z.object({
          title: z.string(),
          url: z.string(),
          logo: image(),
        }),
        roles: z
          .object({
            title: z.string(),
            duration: z.string(),
          })
          .array(),
      })
      .array(),
  });

export type Experience = z.infer<ReturnType<typeof experience>>;
