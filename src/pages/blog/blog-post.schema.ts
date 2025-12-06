import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

export const blogPost = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
  });

export type BlogPost = z.infer<ReturnType<typeof blogPost>>;
