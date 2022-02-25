import { Ast } from "./ast";
import { parseMacroCall, parseMetadata, Peek } from "./parser";
import { applyMacroRecursive, Macro } from "./marco";
import { parseRootBlock } from "./parser";
import { ast2gfm, ast2html } from "./render";

function ptm2ast(src: string, macros: { [key: string]: Macro }): Ast {
    src = src + "\n";
    src = src.replaceAll(/\r\n/g, "\n");
    let blocks = new Peek(src.split(/\n\n/))
    let metadata = parseMetadata(blocks);
    let globalMacroCalls = parseMacroCall(blocks);
    let rootBlocks = blocks.rest();
    const ast: Ast = {
        metadata: metadata,
        globalMacroCalls: globalMacroCalls,
        nodes: rootBlocks.map(b => {
            let node = parseRootBlock(b);
            return applyMacroRecursive(node, globalMacroCalls, macros);
        })
    }

    return ast;
}

function ptm2html(src: string): string {
    const ast = ptm2ast(src, {});
    return ast2html(ast);
}

function ptm2gfm(src: string): string {
    const ast = ptm2ast(src, {});
    return ast2gfm(ast);
}

export { ptm2html, ptm2gfm };
