import { Node, NodeData, NodeType } from "./ast";
import { CacheData, applyCache, startWatchEffect, getNewMacroUsedMetadata, getNewCacheData } from "./cache";
import { easyMap } from "./helper";
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

    applyMacro(macros: { [name: string]: Macro }, forceMacro: MacroCall[]) {
        const gm: MacroCall[] = [...this.globalMacroCalls, ...forceMacro];
        this.nodes = this.nodes.map(n => applyMacroRecursive(n, this.metadata, gm, macros));
    }

    applyMacroWithCache(macros: { [name: string]: Macro }, forceMacro: MacroCall[], lastCache: CacheData): CacheData {
        const gm: MacroCall[] = [...this.globalMacroCalls, ...forceMacro];
        const nodes = applyCache(this, lastCache);
        const [ metadata, macrosProxy, recorder ] = startWatchEffect(this.metadata, macros);
        this.nodes = nodes.map(n => applyMacroRecursive(n, metadata, gm, macrosProxy));
        const macroUsedMetadata = getNewMacroUsedMetadata(lastCache.macroUsedMetadata, recorder);
        return getNewCacheData(lastCache, this, macroUsedMetadata);
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

export { puellocMark, Ptm, Macro, MacroCall, Node, NodeData, NodeType, easyMap };
