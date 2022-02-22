import { MacroCall } from "./marco";

type LowAst = {
    metadata: object,
    globalMacros: MacroCall[],
    title: string,
    rootBlocks: RootBlock[]
};

type RootBlock = {
    rootBlockMarcos: MacroCall[],
    rawData: string
};

type HighAst = {
    metadata: object,
    globalMacros: MacroCall[],
    title: string,
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
    emphasis: { isStrong: boolean, text: string },
    delete: { text: string },
    link: { name: string, title: string, url: string },
    image: { alt: string, title: string, url: string },
    autolink: { url: string },
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
    localMacros: MacroCall[],
    children: Node[],
    rawData: string
} & Distribute<NodeType>;

export { LowAst, HighAst, Node, NodeType }