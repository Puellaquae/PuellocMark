import { MacroCall } from "./marco";

type Ast = {
    metadata: object,
    globalMacroCalls: MacroCall[],
    nodes: Node[]
};

type NodeDatum = {
    // Rootable Block
    break: null,
    title: { level: 1 | 2 | 3 | 4 | 5 | 6, text: string },
    html: { html: string },
    fenceCode: { code: string },
    table: { align: ("left" | "center" | "right")[] },
    para: null,
    // Inline Block
    inlineCode: { code: string },
    escape: { text: string },
    entity: { text: string },
    emphasis: { text: string },
    strong: { text: string },
    del: { text: string },
    link: { name: string, title: string, url: string },
    image: { alt: string, title: string, url: string },
    htmlTag: { tag: Text, alt: string[] }
    emoji: { text: string },
    text: { text: string },
    // Container Block
    quote: null,
    list: null,
    // Internal Block used for table
    tableHeader: null,
    tableRow: null
};

type NodeType = keyof NodeDatum;

// https://stackoverflow.com/questions/51691235/typescript-map-union-type-to-another-union-type
type Distribute<U> = U extends NodeType ? { type: U, data: NodeDatum[U] } : never;

type Node = {
    macros: MacroCall[],
    children: Node[],
    rawData: string
} & Distribute<NodeType>;

export { Ast, Node, NodeType }