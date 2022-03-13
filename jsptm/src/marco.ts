import { Node, NodeType, Ptm } from "./ast";

interface Macro {
    filter: NodeType[],
    func: (node: Node, metadata: Ptm["metadata"], args?: string[]) => Node
}

type MacroCall = {
    name: string,
    args?: string[]
}

function applyMacro(node: Node, metadata: Ptm["metadata"], macroCall: MacroCall, macros: { [key: string]: Macro }): Node {
    const macro = macros[macroCall.name];
    if (macro && (macro.filter.length === 0 || macro.filter.indexOf(node.type) !== -1)) {
        return macro.func(node, metadata, macroCall.args);
    } else {
        return node;
    }
}

function applyMacroRecursive(node: Node, metadata: Ptm["metadata"], globalMacroCall: MacroCall[], macros: { [key: string]: Macro }): Node {
    node.children.map(c => applyMacroRecursive(c, metadata, globalMacroCall, macros));
    for (const macroCall of [...globalMacroCall, ...node.macros]) {
        node = applyMacro(node, metadata, macroCall, macros);
    }
    return node;
}

export { Macro, MacroCall, applyMacro, applyMacroRecursive }