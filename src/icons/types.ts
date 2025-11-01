import { Hamburger } from "./Hamburger";
import { JavaScript } from "./JavaScript";
import { Moon } from "./Moon";
import { Sun } from "./Sun";
import { TypeScript } from "./TypeScript";
import { Database } from "./Database";
import { HTML } from "./HTML";
import { CSS } from "./CSS";
import { Python } from "./Python";
import { React } from "./React";
import { Flask } from "./Flask";
import { Git } from "./Git";
import { GraphQL } from "./GraphQL";
import { PaperPlane } from "./PaperPlane";

export const icons = {
  sun: Sun,
  moon: Moon,
  hamburger: Hamburger,
  javascript: JavaScript,
  typescript: TypeScript,
  database: Database,
  git: Git,
  react: React,
  html: HTML,
  css: CSS,
  flask: Flask,
  python: Python,
  graphql: GraphQL,
  paperPlane: PaperPlane,
} as const;

export type Name = keyof typeof icons;
