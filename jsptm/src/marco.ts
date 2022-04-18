import { Ptm } from ".";
import { Node, NodeData, NodeType } from "./ast";
import { MacroApplyError } from "./error";

interface Macro {
    filter: NodeType[],
    func: (node: Node, metadata: Ptm["metadata"], arg?: string) => NodeData
}

type MacroCall = {
    name: string,
    arg?: string
}

function applyMacro(node: Node, metadata: Ptm["metadata"], macroCall: MacroCall, macros: { [key: string]: Macro }): Node {
    const macro = macros[macroCall.name];
    if (macro && (macro.filter.length === 0 || macro.filter.indexOf(node.type) !== -1)) {
        try {
            const nodedata = macro.func(node, metadata, macroCall.arg);
            return {
                type: nodedata.type,
                data: nodedata.data,
                macros: node.macros,
                children: node.children,
                rawData: node.rawData
            } as Node;
        } catch (e) {
            if (e instanceof Error) {
                throw new MacroApplyError(node, macroCall, e);
            } else {
                throw new MacroApplyError(node, macroCall, new Error(JSON.stringify(e)));
            }
        }
    } else {
        return node;
    }
}

function applyMacroRecursive(node: Node, metadata: Ptm["metadata"], globalMacroCall: MacroCall[], macros: { [key: string]: Macro }): Node {
    node.children = node.children.map(c => applyMacroRecursive(c, metadata, globalMacroCall, macros));
    for (const macroCall of [...node.macros, ...globalMacroCall]) {
        node = applyMacro(node, metadata, macroCall, macros);
    }
    return node;
}

export { Macro, MacroCall, applyMacro, applyMacroRecursive }