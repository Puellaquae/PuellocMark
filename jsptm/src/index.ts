import { applyMacroRecursive, Macro, MacroCall } from "./marco";
import { parseFull } from "./parser";
import { node2html } from "./render";

function PuellocMark(src: string, out: "html", macros: { [name: string]: Macro }, forceMacro: string[]): { metadata: {}, output: string } {
    let ptm = parseFull(src);
    const gm: MacroCall[] = [...ptm.globalMacroCalls, ...forceMacro.map(name => ({ name }))];
    ptm.nodes.map(n => applyMacroRecursive(n, gm, macros));
    let output;
    switch (out) {
        case "html":
            output = ptm.nodes.map(node2html).join("");
            break;
    }
    return {
        metadata: ptm.metadata,
        output
    };
}

export { PuellocMark };