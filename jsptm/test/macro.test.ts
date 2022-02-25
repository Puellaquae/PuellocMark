import { Node, NodeType } from "../src/ast";
import { applyMacro, Macro } from "../src/marco";

const m4: Macro = {
    filter: [],
    func(node: Node): Node {
        return {
            type: "text",
            data: { text: `m4(${node.type})` },
            rawData: node.rawData,
            macros: node.macros,
            children: node.children
        };
    }
}

const m5: Macro = {
    filter: [],
    func(node: Node, args?: string[]): Node {
        return {
            type: "text",
            data: { text: `m5(${args?.length})` },
            rawData: node.rawData,
            macros: node.macros,
            children: node.children
        };
    }
}

const macros = { m4, m5 };

describe("Macro Apply", () => {
    const node: Node = {
        type: "text",
        data: { text: "aa" },
        macros: [],
        rawData: "aa",
        children: []
    };

    const nodem4: Node = {
        type: "text",
        data: { text: "m4(text)" },
        macros: [],
        rawData: "aa",
        children: []
    };

    const nodem5: Node = {
        type: "text",
        data: { text: "m5(2)" },
        macros: [],
        rawData: "aa",
        children: []
    };
    it("no such macro", () => {
        expect(applyMacro(node, { name: "xx" }, macros)).toEqual(node);
    });

    it("simple macro", () => {
        expect(applyMacro(node, { name: "m4" }, macros)).toEqual(nodem4);
    });

    it("use args in macro", () => {
        expect(applyMacro(node, { name: "m5", args: ["a", "b"] }, macros)).toEqual(nodem5);
    });

    it("call test macro", () => {
        expect(applyMacro(node, { name: "m1" }, macros)).toEqual(node);
    });
});