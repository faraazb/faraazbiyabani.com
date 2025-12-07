import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

export const blogPost = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    description: z.string(),
    image: image(),
    updatedAt: z.coerce.date().optional(),
    publishedAt: z.coerce.date(),
  });

export type BlogPost = z.infer<ReturnType<typeof blogPost>>;
