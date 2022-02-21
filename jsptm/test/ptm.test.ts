import { Lines } from "../src/ptm";

describe("Line spilter", () => {
    it("simple CRLF", () => {
        let l = new Lines("line\r\n   leading\r\nending   \r\nempty line\r\n\r\nnoend")
        expect(l.nextLine()).toEqual("line");
        expect(l.nextLine()).toEqual("   leading");
        expect(l.nextLine()).toEqual("ending   ");
        expect(l.nextLine()).toEqual("empty line");
        expect(l.nextLine()).toEqual("");
        expect(l.nextLine()).toEqual("noend");
    });

    it("simple LF", () => {
        let l = new Lines("line\n   leading\nending   \nempty line\n\nnoend")
        expect(l.nextLine()).toEqual("line");
        expect(l.nextLine()).toEqual("   leading");
        expect(l.nextLine()).toEqual("ending   ");
        expect(l.nextLine()).toEqual("empty line");
        expect(l.nextLine()).toEqual("");
        expect(l.nextLine()).toEqual("noend");
    });

    it("mix CRLF and LF", () => {
        let l = new Lines("crlf\r\nlf\nmix\r\n\naltmix\n\r\nnoend")
        expect(l.nextLine()).toEqual("crlf");
        expect(l.nextLine()).toEqual("lf");
        expect(l.nextLine()).toEqual("mix");
        expect(l.nextLine()).toEqual("");
        expect(l.nextLine()).toEqual("altmix");
        expect(l.nextLine()).toEqual("");
        expect(l.nextLine()).toEqual("noend");
    });

    it("after EOF", () => {
        let l1 = new Lines("noend")
        expect(l1.nextLine()).toEqual("noend");
        expect(l1.nextLine()).toEqual(null);
        expect(l1.nextLine()).toEqual(null);

        let l2 = new Lines("end\r\n")
        expect(l2.nextLine()).toEqual("end");
        expect(l2.nextLine()).toEqual("");
        expect(l2.nextLine()).toEqual(null);
        expect(l2.nextLine()).toEqual(null);
    });
})