interface LowAst {
    metadata: object,
    globalMacros: Macro[],
    rootBlock: RootBlock[]
}

interface RootBlock {
    rootBlockMarcos: Macro[],
    rawData: string
}

interface HighAst {
    metadata: object,
    globalMacros: Macro[],
    nodes: Node[]
}

enum NodeType {
    // Rootable Block
    Break = "break",
    Title = "title",
    Html = "html",
    FenceCode = "fence_code",
    Table = "table",
    Para = "para",
    // Inline Blocks
    InlineCode = "inline_code",
    Escape = "escape",
    Entity = "entity",
    Emphasis = "emphasis",
    Delete = "delete",
    Link = "link",
    Image = "image",
    AutoLink = "autolink",
    Emoji = "emoji",
    Text = "text",
    // Container Blocks
    Quote = "quote",
    List = "list"
}

interface Node {
    type: NodeType,
    localMacros: Macro[],
    children: Node[],
    rawData: string
}

export { LowAst, HighAst, Node }