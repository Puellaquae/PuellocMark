import { getMetadata } from "../src/metadata";
import { Lines } from "../src/ptm";

describe("Metadata", () => {
    it("no metadata", () => {
        let l = new Lines("# title \n");
        const o = getMetadata(l);
        expect(o).toEqual({});
        expect(l.nextLine()).toBe("# title ");
    });

    it("empty metadata", () => {
        let l = new Lines("<!---\n--->\n# title \n");
        const o = getMetadata(l);
        expect(o).toEqual({});
        expect(l.nextLine()).toBe("# title ");
    });

    it("simple metadata", () => {
        let l = new Lines("<!---\ntest = 'jsptm'\n--->\n# title \n");
        const o = getMetadata(l);
        expect(o).toEqual({ test: "jsptm" });
        expect(l.nextLine()).toBe("# title ");
    });

    it("multiline metadata", () => {
        let l = new Lines("<!---\ntest = 'jsptm'\n\n[dep]\narray = [1,2,3]\n--->\n# title \n");
        const o = getMetadata(l);
        expect(o).toEqual({ test: "jsptm", dep: { array: [1, 2, 3] } });
        expect(l.nextLine()).toBe("# title ");
    });
});