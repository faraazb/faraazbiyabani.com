import { definePlugin, AttachedPluginData } from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";

const CURSOR_PLACEHOLDER = "{cursor}";
const CURSOR_MARKER = "__EC_CURSOR__";

interface CursorData {
  hasCursor: boolean;
}

const cursorData = new AttachedPluginData<CursorData>(() => ({
  hasCursor: false,
}));

export function expressiveCodeCursor() {
  return definePlugin({
    name: "Cursor placeholder",
    baseStyles: `
      .expressive-code .ec-cursor {
        display: inline-block;
        width: 0.8ch;
        height: 1rem;
        background: currentColor;
        vertical-align: text-bottom;
        animation: ec-cursor-blink 1s steps(2, start) infinite;
      }

      @keyframes ec-cursor-blink {
        0%,
        49% {
          opacity: 1;
        }
        50%,
        100% {
          opacity: 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .expressive-code .ec-cursor {
          animation: none;
        }
      }
    `,
    hooks: {
      preprocessCode: (context) => {
        const blockData = cursorData.getOrCreateFor(context.codeBlock);

        context.codeBlock.getLines().forEach((line) => {
          let searchStart = 0;
          let cursorIndex = line.text.indexOf(CURSOR_PLACEHOLDER, searchStart);

          while (cursorIndex !== -1) {
            blockData.hasCursor = true;
            line.editText(
              cursorIndex,
              cursorIndex + CURSOR_PLACEHOLDER.length,
              CURSOR_MARKER,
            );

            searchStart = cursorIndex + CURSOR_MARKER.length;
            cursorIndex = line.text.indexOf(CURSOR_PLACEHOLDER, searchStart);
          }
        });
      },
      postprocessRenderedBlock: (context) => {
        const blockData = cursorData.getOrCreateFor(context.codeBlock);
        if (!blockData.hasCursor) return;

        const { blockAst } = context.renderData;

        const replaceCursorMarker = (node: any, parent: any, index: number) => {
          if (node.type !== "text") return;
          if (!node.value.includes(CURSOR_MARKER)) return;

          const segments = node.value.split(CURSOR_MARKER);
          const newNodes: any[] = [];

          segments.forEach((segment: string, segmentIndex: number) => {
            if (segment.length) {
              newNodes.push({ type: "text", value: segment });
            }

            if (segmentIndex < segments.length - 1) {
              newNodes.push(
                h("span.ec-cursor", {
                  "aria-hidden": "true",
                  role: "presentation",
                }),
              );
            }
          });

          parent.children.splice(index, 1, ...newNodes);
        };

        const walk = (node: any, parent: any = null) => {
          if (!node || typeof node !== "object") return;

          if (Array.isArray(node)) {
            node.forEach((child) => walk(child, parent));
            return;
          }

          if (parent && parent.children) {
            const childIndex = parent.children.indexOf(node);
            replaceCursorMarker(node, parent, childIndex);
          }

          if (node.children) {
            node.children.slice().forEach((child: any) => walk(child, node));
          }
        };

        walk(blockAst);
      },
    },
  });
}
