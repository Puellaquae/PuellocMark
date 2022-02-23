import { HighAst } from "./ast";
import { applyAstMacroRecursive, applyTextMacro, Macro } from "./marco";
import { parseRootBlock } from "./parser";
import { ptm2lowAst } from "./ptm";
import { highAst2gfm, highAst2html } from "./render";

function ptm2highAst(src: string, macros: { [key: string]: Macro }): HighAst {
    const lowAst = ptm2lowAst(src);
    for (let rootBlock of lowAst.rootBlocks) {
        for (const macroCall of [...lowAst.globalMacros, ...rootBlock.rootBlockMarcos]) {
            rootBlock.rawData = applyTextMacro(rootBlock.rawData, macroCall, macros);
        }
    }

    const highAst: HighAst = {
        metadata: lowAst.metadata,
        globalMacros: lowAst.globalMacros,
        title: lowAst.title,
        nodes: lowAst.rootBlocks.map(b => {
            let node = parseRootBlock(b.rawData);
            node.localMacros.push(...b.rootBlockMarcos);
            return applyAstMacroRecursive(node, lowAst.globalMacros, macros);
        })
    }

    return highAst;
}

function ptm2html(src: string): string {
    const highAst = ptm2highAst(src, {});
    return highAst2html(highAst);
}

function ptm2gfm(src: string): string {
    const highAst = ptm2highAst(src, {});
    return highAst2gfm(highAst);
}

export { ptm2html, ptm2gfm };