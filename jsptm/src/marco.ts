import { Node, NodeType } from "./ast";

type TextMacro = {
    type: "text",
    func: (src: string, args?: string[]) => string
}

type AstMacro = {
    type: "ast",
    filter: NodeType[],
    func: (node: Node, args?: string[]) => Node
}

type Macro = TextMacro | AstMacro;

interface MacroCall {
    name: string,
    args?: string[]
}

function applyTextMacro(raw: string, macroCall: MacroCall, macros: { [key: string]: Macro }): string {
    const macro = macros[macroCall.name];
    if (macro?.type === "text") {
        return macro.func(raw, macroCall.args);
    } else {
        return raw;
    }
}

function applyAstMacro(node: Node, macroCall: MacroCall, macros: { [key: string]: Macro }): Node {
    const macro = macros[macroCall.name];
    if (macro?.type === "ast" && (macro.filter.length === 0 || macro.filter.indexOf(node.type) !== -1)) {
        return macro.func(node, macroCall.args);
    } else {
        return node;
    }
}

function applyAstMacroRecursive(node: Node, globalMacroCall: MacroCall[], macros: { [key: string]: Macro }): Node {
    node.children = node.children.map(c => applyAstMacroRecursive(c, globalMacroCall, macros));
    for (const macroCall of [...globalMacroCall, ...node.localMacros]) {
        node = applyAstMacro(node, macroCall, macros);
    }
    return node;
}

export { Macro, MacroCall, applyAstMacro, applyTextMacro, applyAstMacroRecursive }