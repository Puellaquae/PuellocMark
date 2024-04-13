import { Node, NodeData, NodeType } from "./ast";
import { CacheData, startWatchEffect, getNewCacheData, cacheDataToJson, jsonToCacheData } from "./cache";
import { DeepReadonly, easyMap } from "./helper";
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

    async applyMacro(macros: { [name: string]: Macro }, forceMacro: MacroCall[]) {
        const gm: MacroCall[] = [...this.globalMacroCalls, ...forceMacro];
        this.nodes = await Promise.all(this.nodes.map(n => applyMacroRecursive(n, this.metadata, gm, macros)));
    }

    async applyMacroWithCache(macros: { [name: string]: Macro }, forceMacro: MacroCall[], lastCache: CacheData): Promise<CacheData> {
        const gm: MacroCall[] = [...this.globalMacroCalls, ...forceMacro];
        const [metadata, macrosProxy, recorder] = startWatchEffect(this.metadata, macros, lastCache);
        this.nodes = await Promise.all(this.nodes.map(n => applyMacroRecursive(n, metadata, gm, macrosProxy)));
        return getNewCacheData(recorder);
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

async function puellocMark(src: string, out: "html", macros: { [name: string]: Macro }, forceMacro: MacroCall[]): Promise<{ metadata: {}; output: string; }> {
    let ptm = parseFull(src);
    const gm: MacroCall[] = [...ptm.globalMacroCalls, ...forceMacro];
    ptm.nodes = await Promise.all(ptm.nodes.map(n => applyMacroRecursive(n, ptm.metadata, gm, macros)));
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

export {
    puellocMark,
    Ptm,
    Macro,
    MacroCall,
    Node,
    NodeData,
    NodeType,
    easyMap,
    CacheData,
    cacheDataToJson,
    jsonToCacheData,
    DeepReadonly
};
