import { Node, NodeType } from "./ast";

interface Macro {
    filter: NodeType[],
    func: (node: Node, args?: string[]) => Node
}

type MacroCall = {
    name: string,
    args?: string[]
}

function applyMacro(node: Node, macroCall: MacroCall, macros: { [key: string]: Macro }): Node {
    const macro = macros[macroCall.name];
    if ((macro.filter.length === 0 || macro.filter.indexOf(node.type) !== -1)) {
        return macro.func(node, macroCall.args);
    } else {
        return node;
    }
}

function applyMacroRecursive(node: Node, globalMacroCall: MacroCall[], macros: { [key: string]: Macro }): Node {
    node.children.map(c => applyMacroRecursive(c, globalMacroCall, macros));
    for (const macroCall of [...globalMacroCall, ...node.macros]) {
        node = applyMacro(node, macroCall, macros);
    }
    return node;
}

export { Macro, MacroCall, applyMacro, applyMacroRecursive }