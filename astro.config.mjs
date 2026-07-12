import { defineConfig, fontProviders } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import expressiveCode from "astro-expressive-code";
import { createInlineSvgUrl } from "astro-expressive-code";
import { expressiveCodeCursor, expressiveCodeTerminal } from "./src/utils";

// https://astro.build/config
export default defineConfig({
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.fontsource(),
      // Specify weights that are actually used
      // weights: [400, 500, 600, 700],
      // Specify styles that are actually used
      // styles: ["normal"],
      // Download only font files for characters used on the page
      // subsets: ["latin", "cyrillic"],
    },
  ],
  integrations: [
    preact({
      compat: true,
    }),
    sitemap(),
    icon(),
    expressiveCode({
      plugins: [expressiveCodeTerminal(), expressiveCodeCursor()],
      themes: ["rose-pine-dawn", "poimandres"],
      themeCssSelector: (theme, { styleVariants }) => {
        return `.${theme.type}`;
      },
      styleOverrides: {
        frames: {
          copyIcon: createInlineSvgUrl(
            `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"/></svg>`,
          ),
        },
      },
    }),
    mdx(),
  ],
  site: "https://faraazbiyabani.com",
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Vite 8 dropped tsconfig `paths` resolution for Sass @use/@import.
          // Map the `@styles/` alias back to src/styles and let Sass resolve partials.
          importers: [
            {
              findFileUrl(url) {
                if (!url.startsWith("@styles/")) return null;
                return new URL(
                  `./src/styles/${url.slice("@styles/".length)}`,
                  import.meta.url,
                );
              },
            },
          ],
        },
      },
    },
  },
});
