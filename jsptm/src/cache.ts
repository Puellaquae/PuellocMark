import { Macro, MacroCall, Node, Ptm } from ".";
import { SHA256 } from "crypto-js"
import { NodeBase } from "./ast";
import { UnimplementedError } from "./error";


function macroHash(macro: Macro): string {
    return SHA256(JSON.stringify(macro.filter) + macro.func.toString()).toString();
}

type CacheNode = NodeBase & {
    children: CacheNode[],
    lastGen: Node
};

type MacroName = string;
type MetadataKey = string;

type CacheData = {
    lastMacroHash: Map<MacroName, string>,
    macroUsedMetadata: Map<MacroName, MetadataKey[]>
    lastMetadata: Map<MetadataKey, unknown>,
    lastGlobalMacroCalls: MacroCall[],
    nodes: CacheNode[]
}

function applyCache(ptm: Ptm, cache: CacheData): Node[] {
    throw new UnimplementedError("calcChanged");
}

function startWatchEffect(
    metadata: Ptm["metadata"],
    macros: { [name: string]: Macro }
): [Ptm["metadata"], { [name: string]: Macro }, Map<MacroName, MetadataKey[]>] {
    const recorder = new Map<MacroName, MetadataKey[]>();
    const metadataProxy = new Proxy(metadata, {

    });
    const macrosProxy = new Proxy(macros, {

    });
    return [metadataProxy, macrosProxy, recorder]
}

function getNewMacroUsedMetadata(
    macroUsedMetadata: Map<MacroName, MetadataKey[]>,
    recorder: Map<MacroName, MetadataKey[]>
): Map<MacroName, MetadataKey[]> {
    throw new UnimplementedError("getNewMacroUsedMetadata");
}

function getNewCacheData(
    lastCache: CacheData,
    ptm: Ptm,
    macroUsedMetadata: Map<MacroName, MetadataKey[]>
): CacheData {
    throw new UnimplementedError("getNewCacheData");
}

export {
    CacheData,
    applyCache,
    startWatchEffect,
    getNewMacroUsedMetadata,
    getNewCacheData
};
