enum MacroType {
    Text = "text",
    Ast = "ast"
}

interface TextMacro {
    type: MacroType.Text,
    func: (src: string) => string
}

interface AstMacro {
    type: MacroType.Ast,
    func: (node: Node) => Node
}

type Macro = TextMacro | AstMacro;