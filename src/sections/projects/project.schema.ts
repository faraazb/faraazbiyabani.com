import { z, type SchemaContext } from "astro:content";
import { ZodAccents } from "src/types";

export const project = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    accent: ZodAccents.optional(),
    description: z.string(),
    picture: z.object({
      light: image(),
      dark: image(),
    }),
    links: z
      .object({
        title: z.string(),
        icon: z.string(),
        url: z.string(),
      })
      .array(),
  });

export type Project = z.infer<ReturnType<typeof project>>;
