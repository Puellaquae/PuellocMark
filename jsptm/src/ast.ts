import { MacroCall } from "./marco";

type NodeDatum = {
    // Rootable Block
    break: null,
    title: { level: number },
    fenceCode: { code: string, codetype: string },
    table: { align: ("none" | "left" | "center" | "right")[] },
    para: null,
    // Inline Block
    inlineCode: { code: string },
    emphasis: null,
    strong: null,
    link: { name: string, url: string },
    image: { alt: string, url: string },
    emoji: { name: string },
    text: { text: string },
    // Container Block
    quote: null,
    list: null,
    // Internal Block used for table
    tableHeader: null,
    tableRow: null,
    tableField: null,
    // Internal use for list
    listItem: null,
    // HTML can only be created by parser
    rawHtml: { html: string },
    htmlTag: { tag: string, attr: { key: string, val: string }[] },
    // For macro to return nothing
    void: null,
    // For macro to return multi-nodes
    multinodes: { nodes: NodeData[] };
    // For macro to return multi-nodes, but this will be flatten into each nodes and continue apply macro to all.
    // So this should not appeared in rendering.
    // And it will be pack up into multinodes in applyMacroRecursive
    forknodes: { nodes: NodeData[] };
};

type NodeType = keyof NodeDatum;

// https://stackoverflow.com/questions/51691235/typescript-map-union-type-to-another-union-type
type Distribute<U> = U extends NodeType ? { type: U, data: NodeDatum[U] } : never;

type NodeData = Distribute<NodeType>;

type NodeBase = {
    macros: MacroCall[],
    rawData: string
};

type NodeChildren = {
    children: Node[],
}

type Node = NodeBase & NodeData & NodeChildren;

export { Node, NodeData, NodeType, NodeBase };
