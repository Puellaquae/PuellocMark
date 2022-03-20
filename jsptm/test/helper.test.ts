import { easyMap } from "../src/helper";

it("easyMap", () => {
    let m = easyMap<{ yy: string, zz: number }>();
    m.entry("yy").val = "12";
    expect(m.get("yy")).toBe("12");
    m.entry("yy").or("12").val = "21";
    expect(m.get("yy")).toBe("21");
    m.entry("zz").or(1).val += 2;
    expect(m.get("zz")).toBe(3);
});

it("nonCopy", () => {
    let rm = new Map();
    let m = easyMap<{ yy: string, zz: number }>(rm);
    m.entry("yy").val = "12";
    expect(rm.get("yy")).toBe("12");
    m.entry("yy").or("12").val = "21";
    expect(rm.get("yy")).toBe("21");
    m.entry("zz").or(1).val += 2;
    expect(rm.get("zz")).toBe(3);
});