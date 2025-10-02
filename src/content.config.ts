import { about } from "@sections/about/about.schema";
import { achievements } from "@sections/achievements/achievements.schema";
import { experience } from "@sections/experience/experience.schema";
import { project } from "@sections/projects/project.schema";
import { skills } from "@sections/skills/skills.schema";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { blogPost } from "./pages/blogs/blog-post.schema";

const pages = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/pages" }),
  schema: ({ image }) =>
    z.object({
      sections: z.object({
        about: about({ image }),
        skills: skills,
        experience: experience({ image }),
        projects: z.string().array(),
        achievements: achievements({ image }),
      }),
      embedUrl: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: ({ image }) => project({ image }),
});

const blogs = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/blogs" }),
  schema: blogPost,
});

export const collections = {
  pages,
  projects,
  blogs,
};
