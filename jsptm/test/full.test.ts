import { Ptm } from "../src/";

function f(ptm: string): Ptm {
    return Ptm.parse(ptm);
}

function m(o: object): Map<string, unknown> {
    return new Map(Object.entries(o));
}

describe("Matedata", () => {
    it("empty", () => { expect(f("").metadata).toEqual(m({})) });
    it("empty toml", () => { expect(f("<!---\n--->").metadata).toEqual(m({})) });
    it("blank after only metadata", () => { expect(f('<!---\nstr = "str"\n--->\n').metadata).toEqual(m({ str: "str" })) });
    it("simple", () => { expect(f('<!---\nstr = "str"\n--->').metadata).toEqual(m({ str: "str" })) });
    it("sample", () => {
        expect(f('<!---\n\
# This is a TOML document\n\
\n\
title = "TOML Example"\n\
\n\
[owner]\n\
name = "Tom Preston-Werner"\n\
\n\
[database]\n\
enabled = true\n\
ports = [ 8000, 8001, 8002 ]\n\
data = [ ["delta", "phi"], [3.14] ]\n\
temp_targets = { cpu = 79.5, case = 72.0 }\n\
--->').metadata).toEqual(m({
            title: "TOML Example",
            owner: { name: "Tom Preston-Werner" },
            database: {
                enabled: true,
                ports: [8000, 8001, 8002],
                data: [["delta", "phi"], [3.14]],
                temp_targets: { cpu: 79.5, case: 72.0 }
            }
        }))
    });
});

describe("GlobalMacro", () => {
    it("no macro", () => { expect(f("").globalMacroCalls).toEqual([]) });
    it("simple macro", () => { expect(f("<!M macroA>").globalMacroCalls).toEqual([{ name: "macroA" }]) });
    it("simple macro with args", () => { expect(f("<!M macroA(aa,bb,12,13)>").globalMacroCalls).toEqual([{ name: "macroA", arg: "aa,bb,12,13" }]) });
    it("multi macro", () => { expect(f("<!M macroA><!M macroB>\n<!M macroC>").globalMacroCalls).toEqual([{ name: "macroA" }, { name: "macroB" }, { name: "macroC" }]) });
});