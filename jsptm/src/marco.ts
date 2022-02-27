import { Node, NodeType } from "./ast";

interface Macro {
    filter: NodeType[],
    func: (node: Node, args?: string[]) => Node
}

type MacroCall = {
    name: string,
    args?: string[]
}

export { Macro, MacroCall }