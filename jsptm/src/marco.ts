import { Ptm } from ".";
import { Node, NodeData, NodeType } from "./ast";
import { MacroApplyError } from "./error";

interface Macro {
    filter: NodeType[],
    func: (
        node: Node,
        metadata: Ptm["metadata"],
        arg: string,
    ) => Promise<NodeData | null> | (NodeData | null);
}

type MacroCall = {
    name: string,
    arg?: string
}

async function applyMacro(node: Node, metadata: Ptm["metadata"], macroCall: MacroCall, macros: { [key: string]: Macro }): Promise<Node> {
    const macro = macros[macroCall.name];
    if (macro && (macro.filter.length === 0 || macro.filter.indexOf(node.type) !== -1)) {
        try {
            const nodedata = await macro.func(node, metadata, macroCall.arg ?? "");
            if (nodedata !== null) {
                return {
                    ...nodedata,
                    macros: node.macros,
                    children: node.children,
                    rawData: node.rawData
                };
            } else {
                return node;
            }
        } catch (e) {
            if (e instanceof Error) {
                throw new MacroApplyError(node, macroCall, e);
            } else {
                throw new MacroApplyError(node, macroCall, new Error(JSON.stringify(e)));
            }
        }
    } else {
        return node;
    }
}

async function applyMacroRecursive(node: Node, metadata: Ptm["metadata"], globalMacroCall: MacroCall[], macros: { [key: string]: Macro }): Promise<Node> {
    node.children = (await Promise.all(node.children.map(async c => await applyMacroRecursive(c, metadata, globalMacroCall, macros)))).flat();
    let nodes = [node];
    for (const macroCall of [...node.macros, ...globalMacroCall]) {
        nodes = (await Promise.all(nodes.map(async n => [...flattenNodes(await applyMacro(n, metadata, macroCall, macros))]))).flat();
    }
    if (nodes.length === 1) {
        return nodes[0];
    }
    return {
        type: "multinodes",
        data: {
            nodes
        },
        macros: node.macros,
        children: node.children,
        rawData: node.rawData
    };
}

function* flattenNodes(...nodeArr: Node[]): Generator<Node, void, void> {
    for (const node of nodeArr) {
        if (node.type === "forknodes") {
            yield* flattenNodes(...node.data.nodes.map(d => ({ ...d, macros: node.macros, children: node.children, rawData: node.rawData })));
        } else {
            yield node;
        }
    }
}

export { Macro, MacroCall, applyMacroRecursive, applyMacro };
