import { Node, NodeData } from "./ast";
import { easyMap } from "./helper";
import { applyMacro, applyMacroRecursive, Macro, MacroCall } from "./marco";
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

    applyMacro(macros: { [name: string]: Macro }, forceMacro: MacroCall[]) {
        const gm: MacroCall[] = [...this.globalMacroCalls, ...forceMacro];
        this.nodes = this.nodes.map(n => applyMacroRecursive(n, this.metadata, gm, macros));
    }

    applyMacroTo(macros: { [name: string]: Macro }, macroCall: MacroCall, node: Node) {
        return applyMacro(node, this.metadata, macroCall, macros);
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

function puellocMark(src: string, out: "html", macros: { [name: string]: Macro }, forceMacro: MacroCall[]): { metadata: {}, output: string } {
    let ptm = parseFull(src);
    const gm: MacroCall[] = [...ptm.globalMacroCalls, ...forceMacro];
    ptm.nodes = ptm.nodes.map(n => applyMacroRecursive(n, ptm.metadata, gm, macros));
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

export { puellocMark, Ptm, Macro, Node, NodeData, easyMap };