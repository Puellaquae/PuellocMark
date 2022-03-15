import { Node } from "./ast";
import { EasyMap } from "./helper";
import { applyMacroRecursive, Macro, MacroCall } from "./marco";
import { parseFull } from "./parser";
import { node2html } from "./render";

class Ptm {
    metadata: Map<string, unknown>
    globalMacroCalls: MacroCall[]
    nodes: Node[]

    constructor(metadata: Map<string, unknown>, globalMacroCalls: MacroCall[], nodes: Node[]) {
        this.metadata = metadata;
        this.globalMacroCalls = globalMacroCalls,
            this.nodes = nodes;
    }

    applyMacro(macros: { [name: string]: Macro }, forceMacro: string[]) {
        const gm: MacroCall[] = [...this.globalMacroCalls, ...forceMacro.map(name => ({ name }))];
        this.nodes.map(n => applyMacroRecursive(n, this.metadata, gm, macros));
    }

    render(out: "html") {
        switch (out) {
            case "html":
                return this.nodes.map(node2html).join("");
        }
    }

    static parse(src: string): Ptm {
        return parseFull(src);
    }
};

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

export { puellocMark, Ptm, Macro, Node, EasyMap };