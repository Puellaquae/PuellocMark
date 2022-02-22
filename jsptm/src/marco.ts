import { Node, NodeType } from "./ast";

enum MacroType {
    Text = "text",
    Ast = "ast"
}

interface TextMacro {
    type: MacroType.Text,
    func: (src: string, args?: string[]) => string
}

interface AstMacro {
    type: MacroType.Ast,
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
    if (macro?.type === MacroType.Text) {
        return macro.func(raw, macroCall.args);
    } else {
        return raw;
    }
}

function applyAstMacro(node: Node, macroCall: MacroCall, macros: { [key: string]: Macro }): Node {
    const macro = macros[macroCall.name];
    if (macro?.type === MacroType.Ast && macro.filter.indexOf(node.type) !== -1) {
        return macro.func(node, macroCall.args);
    } else {
        return node;
    }
}

function applyAstMacroRecursive(node: Node, macros: { [key: string]: Macro }): Node {
    node.children = node.children.map(c => applyAstMacroRecursive(c, macros));
    for (const macroCall of node.localMacros) {
        node = applyAstMacro(node, macroCall, macros);
    }
    return node;
}

export { Macro, MacroType, MacroCall, applyAstMacro, applyTextMacro, applyAstMacroRecursive }