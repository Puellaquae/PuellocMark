import { Node, NodeType } from "../src/ast";
import { applyTextMacro, applyAstMacro, Macro } from "../src/marco";
const m1: Macro = {
    type: "text",
    func(_src: string): string {
        return "m1";
    }
}

const m2: Macro = {
    type: "text",
    func(src: string): string {
        return `m2(${src})`;
    }
}

const m3: Macro = {
    type: "text",
    func(src: string, args?: string[]): string {
        return `m3(${src}, ${args?.length})`;
    }
}

const m4: Macro = {
    type: "ast",
    filter: [],
    func(node: Node): Node {
        return {
            type: "text",
            data: { text: `m4(${node.type})` },
            rawData: node.rawData,
            localMacros: node.localMacros,
            children: node.children
        };
    }
}

const m5: Macro = {
    type: "ast",
    filter: [],
    func(node: Node, args?: string[]): Node {
        return {
            type: "text",
            data: { text: `m5(${args?.length})` },
            rawData: node.rawData,
            localMacros: node.localMacros,
            children: node.children
        };
    }
}

const macros = { m1, m2, m3, m4, m5 };

describe("Text Macro Apply", () => {
    it("no such macro", () => {
        expect(applyTextMacro("aa", { name: "xx" }, macros)).toEqual("aa");
    });

    it("simple macro", () => {
        expect(applyTextMacro("aa", { name: "m1" }, macros)).toEqual("m1");
    });

    it("use src in macro", () => {
        expect(applyTextMacro("aa", { name: "m2" }, macros)).toEqual("m2(aa)");
    });

    it("use src and args in macro", () => {
        expect(applyTextMacro("aa", { name: "m3", args: ["a", "b"] }, macros)).toEqual("m3(aa, 2)");
    });

    it("call ast macro", () => {
        expect(applyTextMacro("aa", { name: "m4" }, macros)).toEqual("aa");
    });
});

describe("AST Macro Apply", () => {
    const node: Node = {
        type: "text",
        data: { text: "aa" },
        localMacros: [],
        rawData: "aa",
        children: []
    };

    const nodem4: Node = {
        type: "text",
        data: { text: "m4(text)" },
        localMacros: [],
        rawData: "aa",
        children: []
    };

    const nodem5: Node = {
        type: "text",
        data: { text: "m5(2)" },
        localMacros: [],
        rawData: "aa",
        children: []
    };
    it("no such macro", () => {
        expect(applyAstMacro(node, { name: "xx" }, macros)).toEqual(node);
    });

    it("simple macro", () => {
        expect(applyAstMacro(node, { name: "m4" }, macros)).toEqual(nodem4);
    });

    it("use args in macro", () => {
        expect(applyAstMacro(node, { name: "m5", args: ["a", "b"] }, macros)).toEqual(nodem5);
    });

    it("call test macro", () => {
        expect(applyAstMacro(node, { name: "m1" }, macros)).toEqual(node);
    });
});