import { Ptm } from "../src/ast";
import { parseFull } from "../src/parser";

function f(ptm: string): Ptm {
    return parseFull(ptm);
}

describe("Matedata", () => {
    it("empty", () => { expect(f("").metadata).toEqual({}) });
    it("empty toml", () => { expect(f("<!---\n--->").metadata).toEqual({}) });
    it("simple", () => { expect(f('<!---\nstr = "str"\n--->').metadata).toEqual({ str: "str" }) });
    it("sample", () => {
        expect(f('<!---\n\
# This is a TOML document\n\
title = "TOML Example"\n\
[owner]\n\
name = "Tom Preston-Werner"\n\
[database]\n\
enabled = true\n\
ports = [ 8000, 8001, 8002 ]\n\
data = [ ["delta", "phi"], [3.14] ]\n\
temp_targets = { cpu = 79.5, case = 72.0 }\n\
--->').metadata).toEqual({
            title: "TOML Example",
            owner: { name: "Tom Preston-Werner" },
            database: {
                enabled: true,
                ports: [8000, 8001, 8002],
                data: [["delta", "phi"], [3.14]],
                temp_targets: { cpu: 79.5, case: 72.0 }
            }
        })
    });
});

describe("GlobalMacro", () => {
    it("no macro", () => { expect(f("").globalMacroCalls).toEqual([]) });
    it("simple macro", () => { expect(f("<!M macroA>").globalMacroCalls).toEqual([{ name: "macroA", args: [] }]) });
    it("simple macro with args", () => { expect(f("<!M macroA(aa,bb,12,13)>").globalMacroCalls).toEqual([{ name: "macroA", args: ["aa", "bb", "12", "13"] }]) });
    it("multi macro", () => { expect(f("<!M macroA><!M macroB>\n<!M macroC>").globalMacroCalls).toEqual([{ name: "macroA", args: [] }, { name: "macroB", args: [] }, { name: "macroC", args: [] }]) });
});