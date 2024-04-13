import { Macro, Node, NodeData, Ptm } from ".";
import { SHA256 } from "crypto-js"
import { DeepReadonly } from "./helper";

function macroHash(macro: Macro): string {
    return SHA256(JSON.stringify(macro.filter) + macro.func.toString()).toString();
}

function macroApplyHash(macro: Macro, node: DeepReadonly<Node>, arg: string): string {
    const msg = {
        macro: macroHash(macro),
        data: node.data,
        type: node.type,
        arg
    }
    return SHA256(JSON.stringify(msg)).toString();
}

type MacroName = string;
type MetadataKey = string;
type HashType = string;
type MetadataAccessInfo = {
    access: "read" | "write",
    key: MetadataKey,
    value: unknown
}

type MacroApplyInfo = Map<HashType, {
    metadataAccess: MetadataAccessInfo[],
    gen: NodeData | null
}>;

type CacheData = {
    lastMacroHash: Map<MacroName, HashType>,
    lastMacroApply: MacroApplyInfo
}

class Recorder {
    recorderMeta: Map<HashType, MetadataAccessInfo[]> = new Map();
    recorderGen: Map<HashType, NodeData | null> = new Map();
    macroHash: Map<MacroName, HashType> = new Map();
    currentMacroHash: string = "";

    macroRead(key: string, value: unknown) {
        if (!this.recorderMeta.has(this.currentMacroHash)) {
            this.recorderMeta.set(this.currentMacroHash, [{
                access: "read",
                key,
                value
            }]);
        } else {
            this.recorderMeta.get(this.currentMacroHash)?.push({
                access: "read",
                key,
                value
            });
        }
    }

    macroWrite(key: string, value: unknown) {
        if (!this.recorderMeta.has(this.currentMacroHash)) {
            this.recorderMeta.set(this.currentMacroHash, [{
                access: "write",
                key,
                value
            }]);
        } else {
            this.recorderMeta.get(this.currentMacroHash)?.push({
                access: "write",
                key,
                value
            });
        }
    }
}

function startWatchEffect(
    metadata: Ptm["metadata"],
    macros: { [name: string]: Macro },
    lastCache: CacheData
): [Ptm["metadata"], { [name: string]: Macro }, Recorder] {
    const recorder = new Recorder();
    const changedMacro: MacroName[] = [];
    Object.entries(macros).forEach(([name, macro]) => {
        const hash = macroHash(macro);
        recorder.macroHash.set(name, hash);
        if (lastCache.lastMacroHash.get(name) !== hash) {
            changedMacro.push(name);
        }
    })
    const metadataProxy = new Proxy(metadata, {
        get(target, p, r) {
            if (p === "get") {
                return (key: string): unknown => {
                    const value = target.get(key);
                    recorder.macroRead(key, value);
                    return value;
                }
            } else if (p === "set") {
                return (key: string, value: unknown): Map<string, unknown> => {
                    const res = target.set(key, value);
                    recorder.macroWrite(key, value);
                    return res;
                }
            } else {
                const res = Reflect.get(target, p, r);
                if (typeof(res) === "function") {
                    return res.bind(target);
                }
                return res;
            }
        },
    });
    const macrosProxy = new Proxy(macros, {
        get(t, p, r1) {
            const res = Reflect.get(t, p, r1);
            if (typeof (p) === "string") {
                const macroName = p;
                const macro = macros[p];
                return new Proxy(macro, {
                    get(target, prop, r2) {
                        if (prop === "func") {
                            return async (
                                node: Node,
                                metadata: Ptm["metadata"],
                                arg: string,
                            ): Promise<NodeData | null> => {
                                const hash = macroApplyHash(target, node, arg);
                                recorder.currentMacroHash = hash;
                                let res: NodeData | null;
                                if (changedMacro.includes(macroName)) {
                                    res = await target.func(node, metadata, arg);
                                } else if (!lastCache.lastMacroApply.has(hash)) {
                                    res = await target.func(node, metadata, arg);
                                } else {
                                    const lastApplyBehavior = lastCache.lastMacroApply.get(hash)!!;
                                    const lastMetadataAccess = lastApplyBehavior.metadataAccess || [];
                                    const metadataChanged = lastMetadataAccess.some(
                                        a => a.access === "read" && metadata.get(a.key) !== a.value
                                    );
                                    if (metadataChanged) {
                                        res = await target.func(node, metadata, arg);
                                    } else {
                                        res = lastApplyBehavior.gen;
                                        lastMetadataAccess.forEach(a => {
                                            if (a.access === "write") {
                                                metadata.set(a.key, a.value);
                                            }
                                        });
                                        recorder.recorderMeta.set(hash, lastMetadataAccess);
                                    }
                                }
                                recorder.recorderGen.set(hash, res);
                                return res;
                            }
                        } else {
                            const res = Reflect.get(target, prop, r2);
                            if (typeof(res) === "function") {
                                return res.bind(target);
                            }
                            return res;
                        }
                    },
                });
            }
            if (typeof(res) === "function") {
                return res.bind(t);
            }
            return res;
        }
    });
    return [metadataProxy, macrosProxy, recorder]
}

function getNewCacheData(recorder: Recorder): CacheData {
    const lastMacroApply: CacheData["lastMacroApply"] = new Map();
    for (const k of recorder.recorderGen.keys()) {
        lastMacroApply.set(k, {
            metadataAccess: recorder.recorderMeta.get(k) ?? [],
            gen: recorder.recorderGen.get(k)!!
        });
    }
    return {
        lastMacroHash: recorder.macroHash,
        lastMacroApply
    };
}

type MapEntries<T> = T extends Map<infer K, infer V> ? [K, V] : never;

type CacheDataHelper = {
    [K in keyof CacheData]: MapEntries<CacheData[K]>[]
}

function cacheDataToJson(cache: CacheData): string {
    return JSON.stringify({
        lastMacroHash: [...cache.lastMacroHash.entries()],
        lastMacroApply: [...cache.lastMacroApply.entries()]
    });
}

function jsonToCacheData(json: string): CacheData {
    const data = JSON.parse(json) as unknown as CacheDataHelper;
    return {
        lastMacroApply: new Map(data.lastMacroApply),
        lastMacroHash: new Map(data.lastMacroHash)
    };
}

export {
    CacheData,
    startWatchEffect,
    getNewCacheData,
    cacheDataToJson,
    jsonToCacheData,
};
