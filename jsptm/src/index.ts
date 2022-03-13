import { Ptm } from "./ast";
import { applyMacroRecursive, Macro, MacroCall } from "./marco";
import { parseFull } from "./parser";
import { node2html } from "./render";

function puellocMark(src: string, out: "html", macros: { [name: string]: Macro }, forceMacro: string[]): { metadata: {}, output: string } {
    let ptm = parseFull(src);
    const gm: MacroCall[] = [...ptm.globalMacroCalls, ...forceMacro.map(name => ({ name }))];
    ptm.nodes.map(n => applyMacroRecursive(n, ptm.metadata, gm, macros));
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

function applyMacro(ptm: Ptm, macros: { [name: string]: Macro }, forceMacro: string[]) {
    const gm: MacroCall[] = [...ptm.globalMacroCalls, ...forceMacro.map(name => ({ name }))];
    ptm.nodes.map(n => applyMacroRecursive(n, ptm.metadata, gm, macros));
}

function render(ptm: Ptm, out: "html") {
    switch (out) {
        case "html":
            return ptm.nodes.map(node2html).join("");
    }
}

export { puellocMark, Ptm, parseFull as parse, applyMacro, render, Macro };