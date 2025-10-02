import { definePlugin, AttachedPluginData } from "@expressive-code/core";

const DEFAULT_PROMPT = "❯";

interface TerminalData {
  prompt: string;
  separatorLineIndices: number[];
  outputLineIndices: number[];
}

const terminalData = new AttachedPluginData<TerminalData>(() => ({
  prompt: DEFAULT_PROMPT,
  separatorLineIndices: [],
  outputLineIndices: [],
}));

const PROMPT_META_KEY = "prompt";

export function expressiveCodeTerminal() {
  return definePlugin({
    name: "Terminal block enhancements",
    baseStyles: `
      .expressive-code .frame.has-terminal pre .ec-line.command .code::before {
        content: attr(data-ec-terminal-prompt);
        margin-inline-end: 0.5ch;
        color: var(--ec-fgSubtle);
      }

      .expressive-code .frame.has-terminal pre .ec-line.separator {
        display: none;
      }

      .expressive-code .frame.has-terminal pre .ec-line.output .code::before {
        content: "";
        margin-inline-end: 0;
      }

      .expressive-code .frame.has-terminal pre .ec-line.output {
        opacity: 0.8;
      }
    `,
    hooks: {
      preprocessMetadata: ({ codeBlock }) => {
        const promptOption = codeBlock.metaOptions.getString(PROMPT_META_KEY);
        if (!promptOption) return;

        const blockData = terminalData.getOrCreateFor(codeBlock);
        blockData.prompt = promptOption;
      },
      preprocessCode: (context) => {
        const promptOption = context.codeBlock.metaOptions.getString(PROMPT_META_KEY);
        if (!promptOption) return;

        const blockData = terminalData.getOrCreateFor(context.codeBlock);
        
        // Identify separator and output lines, but don't delete them
        let isOutputSection = false;
        context.codeBlock.getLines().forEach((line, index) => {
          if (line.text.startsWith("---")) {
            blockData.separatorLineIndices.push(index);
            isOutputSection = !isOutputSection;
          } else if (isOutputSection) {
            blockData.outputLineIndices.push(index);
          }
        });
      },
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const promptOption = codeBlock.metaOptions.getString(PROMPT_META_KEY);
        if (!promptOption) return;

        const blockData = terminalData.getOrCreateFor(codeBlock);

        // blockAst itself is the figure frame element - add has-terminal class
        const frameNode = renderData.blockAst;
        if (frameNode.type === "element" && frameNode.tagName === "figure") {
          frameNode.properties ??= {};
          frameNode.properties.className = Array.from(
            new Set([...(frameNode.properties.className ?? []), "has-terminal"])
          );
        }

        // Find the pre element in children
        const preNode = renderData.blockAst.children.find(
          (child: any) =>
            child.type === "element" &&
            child.tagName === "pre"
        );

        if (!preNode) return;

        // Find the code element inside pre
        const codeElement = preNode.children.find(
          (child: any) =>
            child.type === "element" &&
            child.tagName === "code"
        );

        if (!codeElement) return;

        // Process each line (ec-line divs are children of code element)
        codeElement.children.forEach((lineNode: any, lineIndex: number) => {
          if (lineNode.type !== "element") return;
          if (!lineNode.properties?.className?.includes("ec-line")) return;

          // Determine line type
          const isSeparator = blockData.separatorLineIndices.includes(lineIndex);
          const isOutput = blockData.outputLineIndices.includes(lineIndex);
          const isCommand = !isSeparator && !isOutput;

          // Add appropriate class
          lineNode.properties.className = Array.from(
            new Set([
              ...(lineNode.properties.className ?? []),
              isSeparator ? "separator" : isOutput ? "output" : "command",
            ])
          );

          // Add copy exclusion for separators and output
          if (isSeparator || isOutput) {
            lineNode.properties["data-ec-copy-exclude"] = "";
          }

          // Add prompt to command lines
          if (isCommand) {
            const codeNode = lineNode.children.find(
              (child: any) =>
                child.type === "element" &&
                child.properties?.className?.includes("code")
            );

            if (codeNode) {
              codeNode.properties ??= {};
              codeNode.properties["data-ec-terminal-prompt"] = blockData.prompt;
            }
          }
        });
      },
    },
  });
}

