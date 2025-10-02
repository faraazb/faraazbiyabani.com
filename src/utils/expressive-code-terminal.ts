import { definePlugin, AttachedPluginData } from "@expressive-code/core";

const DEFAULT_PROMPT = "❯";

interface TerminalData {
    prompt: string;
    outputLineIndices: number[];
    commandLinesText: string[];
}

const terminalData = new AttachedPluginData<TerminalData>(() => ({
    prompt: DEFAULT_PROMPT,
    outputLineIndices: [],
    commandLinesText: [],
}));

const PROMPT_META_KEY = "prompt";
const OUTPUT_META_KEY = "output";

/**
 * Parse line range notation like "2-4" or "2,4-6,8" into an array of line indices (0-based)
 */
function parseLineRanges(rangeStr: string): number[] {
    const indices = new Set<number>();

    // Split by comma for multiple ranges
    const parts = rangeStr.split(',').map(s => s.trim());

    for (const part of parts) {
        if (part.includes('-')) {
            // Range like "2-4"
            const [startStr, endStr] = part.split('-').map(s => s.trim());
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);

            if (!isNaN(start) && !isNaN(end)) {
                // Convert from 1-based to 0-based indexing
                for (let i = start - 1; i < end; i++) {
                    indices.add(i);
                }
            }
        } else {
            // Single line like "2"
            const line = parseInt(part, 10);
            if (!isNaN(line)) {
                // Convert from 1-based to 0-based indexing
                indices.add(line - 1);
            }
        }
    }

    return Array.from(indices).sort((a, b) => a - b);
}

export function expressiveCodeTerminal() {
    return definePlugin({
        name: "Terminal block enhancements",
        baseStyles: `
      .expressive-code .frame.has-terminal pre .ec-line.command .code::before {
        content: attr(data-ec-terminal-prompt);
        margin-inline-end: 0.5ch;
        color: var(--ec-fgSubtle);
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
                const outputRange = codeBlock.metaOptions.getRange?.(OUTPUT_META_KEY);
                
                // Plugin activates if either prompt or output is present
                if (!promptOption && !outputRange) return;

                const blockData = terminalData.getOrCreateFor(codeBlock);
                
                // Use provided prompt or default
                blockData.prompt = promptOption || DEFAULT_PROMPT;

                // Parse output line ranges from meta
                // getRange returns a string like "2-4" or "2,4-6,8" for output={2-4} or output={2,4-6,8}
                if (outputRange) {
                    blockData.outputLineIndices = parseLineRanges(outputRange);
                }
            },
            preprocessCode: (context) => {
                const promptOption = context.codeBlock.metaOptions.getString(PROMPT_META_KEY);
                const outputRange = context.codeBlock.metaOptions.getRange?.(OUTPUT_META_KEY);
                
                // Plugin activates if either prompt or output is present
                if (!promptOption && !outputRange) return;

                const blockData = terminalData.getOrCreateFor(context.codeBlock);

                // Collect command line text (non-output lines) for the copy button
                context.codeBlock.getLines().forEach((line, index) => {
                    const isOutput = blockData.outputLineIndices.includes(index);
                    if (!isOutput) {
                        blockData.commandLinesText.push(line.text);
                    }
                });
            },
            postprocessRenderedBlock: ({ codeBlock, renderData }) => {
                const promptOption = codeBlock.metaOptions.getString(PROMPT_META_KEY);
                const outputRange = codeBlock.metaOptions.getRange?.(OUTPUT_META_KEY);
                
                // Plugin activates if either prompt or output is present
                if (!promptOption && !outputRange) return;

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

                     // Determine if this line is output
                     const isOutput = blockData.outputLineIndices.includes(lineIndex);

                     // Add appropriate class
                     lineNode.properties.className = Array.from(
                         new Set([
                             ...(lineNode.properties.className ?? []),
                             isOutput ? "output" : "command",
                         ])
                     );

                     // Add prompt to command lines only
                     if (!isOutput) {
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

                 // Update the copy button's data-code to only include command lines
                 const copyButtonWrapper = renderData.blockAst.children.find(
                     (child: any) =>
                         child.type === "element" &&
                         child.properties?.className?.includes("copy")
                 );

                 if (copyButtonWrapper) {
                     const copyButton = copyButtonWrapper.children?.find(
                         (child: any) => child.type === "element" && child.tagName === "button"
                     );

                     if (copyButton?.properties) {
                         // Replace the data-code with only command lines collected during preprocessing
                         copyButton.properties["data-code"] = blockData.commandLinesText.join("\n");
                     }
                 }
             },
        },
    });
}

