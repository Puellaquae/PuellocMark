import { parseSingle } from "../src/parser";
import { node2html } from "../src/render";

function p(ptm: string): string {
    return node2html(parseSingle(ptm));
}

describe("Emphasis", () => {
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
});

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
});

describe("List", () => {
    it("1", () => { expect(p("- 1\n- 2\n- 3")).toBe("<ul><li>1</li><li>2</li><li>3</li></ul>"); });
    it("2", () => { expect(p("- 1\n- 2\n  - 21\n  - 22")).toBe("<ul><li>1</li><li>2<ul><li>21</li><li>22</li></ul></li></ul>"); });
});

describe("Link", () => {
    it("1", () => { expect(p("[foo](bar)")).toBe('<p><a href="bar">foo</a></p>'); });
    it("2", () => { expect(p("[foo bar](bar foo)")).toBe('<p><a href="bar foo">foo bar</a></p>'); });
});

describe("Image", () => {
    it("1", () => { expect(p("![foo](bar)")).toBe('<p><img alt="foo" src="bar"/></p>'); });
    it("2", () => { expect(p("![foo bar](bar foo)")).toBe('<p><img alt="foo bar" src="bar foo"/></p>'); });
});

describe("Blockquote", () => {
    it("1", () => { expect(p("> xxx")).toBe('<blockquote><p>xxx</p></blockquote>'); });
    it("2", () => { expect(p("> - 1\n> - 2\n> - 3")).toBe('<blockquote><ul><li>1</li><li>2</li><li>3</li></ul></blockquote>'); });
});

describe("Emoji", () => {
    it("1", () => { expect(p(":emoji_is_unsupported_now:")).toBe('<p><span>emoji_is_unsupported_now</span></p>'); });
});

describe("Table", () => {
    it("1", () => { expect(p("|foo|\n|-|\n|bar|")).toBe('<table><thead><th>foo</th></thead><tbody><tr><td>bar</td></tr></tbody></table>'); });
    it("2", () => { expect(p("|foo1|foo2|\n|:-|-:|\n|bar1|bar2|")).toBe('<table><thead><th align="left">foo1</th><th align="right">foo2</th></thead><tbody><tr><td align="left">bar1</td><td align="right">bar2</td></tr></tbody></table>'); });
    it("3", () => { expect(p("|foo|\n|:-:|\n|bar|\n|bas|\n|bat|")).toBe('<table><thead><th align="center">foo</th></thead><tbody><tr><td align="center">bar</td></tr><tr><td align="center">bas</td></tr><tr><td align="center">bat</td></tr></tbody></table>'); });
});

describe("InlineCode", () => {
    it("empty", () => {expect(p("` `")).toBe("<p><code></code></p>")})
    it("double sign", () => {expect(p("`` ` ``")).toBe("<p><code>`</code></p>")})
    it("code", () => {expect(p("``abcc<  >cbaa``")).toBe("<p><code>abcc&lt;  &gt;cbaa</code></p>")})
    it("near", () => {expect(p("`aa``bb`")).toBe("<p><code>aa</code><code>bb</code></p>")})
})

describe("FenceCode", () => {
    it("empty", () => {expect(p("```\n```")).toBe('<pre><code lang=""></code></pre>')});
    it("simple", () => {expect(p(
'```js\n\
it("empty", () => {\n\
    expect(p("```\n```")).toBe(\'<pre><code lang=""></code></pre>\')\n\
});\n\
```'
    )).toBe('<pre><code lang="js">\
it("empty", () =&gt; {\n\
    expect(p("```\n```")).toBe(\'&lt;pre&gt;&lt;code lang=""&gt;&lt;/code&gt;&lt;/pre&gt;\')\n\
});</code></pre>')});
})