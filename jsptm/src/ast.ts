import { MacroCall } from "./marco";

type Ptm = {
    metadata: object,
    globalMacroCalls: MacroCall[],
    nodes: Node[]
};

type NodeDatum = {
    // Rootable Block
    break: null,
    title: { level: number },
    fenceCode: { code: string, codetype: string },
    table: { align: ("left" | "center" | "right")[] },
    para: null,
    // Inline Block
    inlineCode: { code: string },
    emphasis: { text: string },
    strong: { text: string },
    del: { text: string },
    link: { name: string, title: string, url: string },
    image: { alt: string, title: string, url: string },
    emoji: { name: string },
    text: { text: string },
    // Container Block
    quote: null,
    list: null,
    // Internal Block used for table
    tableRow: null,
    tableField: null,
    // Internal use for list
    listItem: null,
    // raw HTML can only be created by parser
    html: { html: string },
};

type NodeType = keyof NodeDatum;

// https://stackoverflow.com/questions/51691235/typescript-map-union-type-to-another-union-type
type Distribute<U> = U extends NodeType ? { type: U, data: NodeDatum[U] } : never;

type Node = {
    macros: MacroCall[],
    children: Node[],
    rawData: string
} & Distribute<NodeType>;

export { Ptm, Node, NodeType }