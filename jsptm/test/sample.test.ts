import { parseSingle } from "../src/parser";
import { node2html } from "../src/render";

function p(ptm: string): string {
    return node2html(parseSingle(ptm));
}

describe("Emphasis and strong emphasis", () => {
    it("1", () => { expect(p("*foo bar*")).toBe("<p><em>foo bar</em></p>"); });
    it("2", () => { expect(p(" * foo bar * ")).toBe("<p> * foo bar * </p>"); });
    it("3", () => { expect(p("foo*bar*")).toBe("<p>foo<em>bar</em></p>"); });
    it("4", () => { expect(p("*foo*bar")).toBe("<p><em>foo</em>bar</p>"); });
    it("5", () => { expect(p("x*y*z")).toBe("<p>x<em>y</em>z</p>"); });
    it("6", () => { expect(p("**foo bar**")).toBe("<p><strong>foo bar</strong></p>"); });
    it("7", () => { expect(p("** foo bar ** ")).toBe("<p>** foo bar ** </p>"); });
    it("8", () => { expect(p("foo**bar**")).toBe("<p>foo<strong>bar</strong></p>"); });
    it("9", () => { expect(p("**foo**bar")).toBe("<p><strong>foo</strong>bar</p>"); });
    it("10", () => { expect(p("x**y**z")).toBe("<p>x<strong>y</strong>z</p>"); });
    it("11", () => { expect(p("*foo **bar** baz*")).toBe("<p><em>foo <strong>bar</strong> baz</em></p>"); });
    it("12", () => { expect(p("*foo**bar**baz*")).toBe("<p><em>foo<strong>bar</strong>baz</em></p>"); });
    it("13", () => { expect(p("***foo** bar*")).toBe("<p><em><strong>foo</strong> bar</em></p>"); });
    it("14", () => { expect(p("*foo **bar***")).toBe("<p><em>foo <strong>bar</strong></em></p>"); });
    it("15", () => { expect(p("*foo**bar***")).toBe("<p><em>foo<strong>bar</strong></em></p>"); });
    it("16", () => { expect(p("foo***bar***baz")).toBe("<p>foo<em><strong>bar</strong></em>baz</p>"); });
    it("17", () => { expect(p("*foo **bar *baz* bim** bop*")).toBe("<p><em>foo <strong>bar <em>baz</em> bim</strong> bop</em></p>"); });
    it("18", () => { expect(p("**foo *bar* baz**")).toBe("<p><strong>foo <em>bar</em> baz</strong></p>"); });
    it("19", () => { expect(p("**foo*bar*baz**")).toBe("<p><strong>foo<em>bar</em>baz</strong></p>"); });
    it("20", () => { expect(p("***foo* bar**")).toBe("<p><strong><em>foo</em> bar</strong></p>"); });
    it("21", () => { expect(p("**foo *bar***")).toBe("<p><strong>foo <em>bar</em></strong></p>"); });
    it("22", () => { expect(p("**foo**")).toBe("<p><strong>foo</strong></p>"); });
    it("23", () => { expect(p("***foo***")).toBe("<p><em><strong>foo</strong></em></p>"); });
})

describe("Title", () => {
    it("1", () => { expect(p("# a")).toBe("<h1>a</h1>"); });
    it("2", () => { expect(p("## a")).toBe("<h2>a</h2>"); });
    it("3", () => { expect(p("### a")).toBe("<h3>a</h3>"); });
    it("4", () => { expect(p("#### a")).toBe("<h4>a</h4>"); });
    it("5", () => { expect(p("##### a")).toBe("<h5>a</h5>"); });
    it("6", () => { expect(p("###### a")).toBe("<h6>a</h6>"); });
    it("7", () => { expect(p("###a")).toBe("<p>###a</p>"); });
    it("8", () => { expect(p("####### a")).toBe("<p>####### a</p>"); });
    it("9", () => { expect(p(" # a")).toBe("<p> # a</p>"); });
});

describe("Break", () => {
    it("1", () => { expect(p("----")).toBe("<hr/>"); });
    it("2", () => { expect(p("------")).toBe("<hr/>"); });
})