import { EasyMap } from "../src/helper";

it("easyMap", () => {
    let m = new EasyMap();
    m.entry<string>("yy").val = "12";
    expect(m.get("yy")).toBe("12");
    m.entry<string>("yy").or("12").val = "21";
    expect(m.get("yy")).toBe("21");
    m.entry<number>("zz").or(1).val += 2;
    expect(m.get("zz")).toBe(3);
});