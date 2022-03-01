import TOML from '@ltd/j-toml';
import { Node } from "./ast";
import { MacroCall } from './marco';
import { Regexs } from './reg';

class Peek {
    content: string[];
    index: number = 0;
    constructor(str: string) {
        this.content = [...str];
    }

    peek(offset: number = 0, len: number = 1): string {
        return this.content.slice(this.index + offset, this.index + offset + len).join("");
    }

    next(len: number = 1): string {
        const ret = this.content.slice(this.index, this.index + len).join("");
        this.index += len;
        return ret;
    }

    rest(): string {
        return this.content.slice(this.index).join("");
    }

    end(): boolean {
        return this.index >= this.content.length;
    }
}

function parseSingle(src: string): Node {
    return parseRootBlock(new Peek(src.replaceAll(/\r\n/g, "\n")));
}

function parseRootBlock(data: Peek): Node {
    let macros: MacroCall[] = [];
    let node: Node;
    const lines = data.rest().split("\n");
    let idx = 0;
    for (; idx < lines.length; idx++) {
        if (Regexs.rootMacrocall.test(lines[idx])) {
            macros.push(...parseMacroCall(new Peek(lines[idx])));
        } else {
            break;
        }
    }
    data = new Peek(lines.splice(idx).join("\n"));
    switch (data.peek()) {
        case ">":
            if (data.peek(0, 2) === "> ") {
                node = parseQuote(data);
            } else {
                node = parsePara(data);
            }
            break;
        case "-":
            if (data.peek(0, 4) === "----") {
                node = parseBreak(data);
                break;
            }
        case "+":
        case "*":
            if (data.peek(1) === " ") {
                node = parseList(data);
            } else {
                node = parsePara(data);
            }
            break;
        case "#":
            if (Regexs.title.test(data.peek(0, 7))) {
                node = parseTitle(data);
            }
            else {
                node = parsePara(data);
            }
            break;
        case "`":
            if (data.peek(0, 3) === "```") {
                node = parseFenceCode(data);
            } else {
                node = parsePara(data);
            }
            break;
        case "|":
            node = parseTable(data);
            break;
        default:
            node = parsePara(data);
            break;
    }
    node.macros = macros;
    if (!data.end()) {
        throw "Data shouldn't has rest after parse";
    }
    return node;
}

function parseQuote(data: Peek): Node {
    if (data.peek(0, 2) !== "> ") {
        throw "Quote should startwith > ";
    }
    const rawData = data.rest();
    data.next(2);
    return {
        type: "quote",
        data: null,
        macros: [],
        rawData,
        children: [parseRootBlock(data)]
    };
}

function parsePara(data: Peek): Node {
    const rawData = data.rest();
    return {
        type: "para",
        data: null,
        macros: [],
        rawData,
        children: parseInlineBlocks(data)
    };
}

function parseBreak(data: Peek): Node {
    const rawData = data.rest();
    const cap = Regexs.break.exec(rawData);
    if (cap) {
        data.next(cap[0].length);
        return {
            type: "break",
            data: null,
            macros: [],
            rawData,
            children: []
        }
    } else {
        throw `${rawData} isn't break`;
    }
}

function parseList(data: Peek): Node {
    const rawData = data.rest();
    const listIdf = data.peek(0, 2);
    if (!Regexs.listIdf.test(listIdf)) {
        throw "Not a list";
    }
    const lines = rawData.split("\n");
    let nodes: Node[] = [];
    let item = [];
    let inItem = false;
    for (const line of lines) {
        if (line.startsWith(listIdf)) {
            let children = []
            children.push(...parseInlineBlocks(new Peek(item[0])));
            if (item.length > 1) {
                children.push(parseRootBlock(new Peek(
                    item.slice(1)
                        .map(l => l.substring(2))
                        .join("\n"))))
            }
            nodes.push({
                type: "listItem",
                data: null,
                rawData: item.join("\n"),
                macros: [],
                children
            });
            item = [];
            item.push(line);
        } else if (inItem && line.startsWith("  ")) {
            item.push(line);
        } else {
            throw `List breaked at ${line}`;
        }
    }
    return {
        type: "list",
        data: null,
        macros: [],
        rawData,
        children: nodes
    };
}

function parseTitle(data: Peek): Node {
    const rawData = data.rest();
    if (!Regexs.title.test(data.peek(0, 7))) {
        throw `${rawData} isn't match title`;
    }
    let level: number = 0;
    while (!data.end()) {
        if (data.peek() === "#") {
            level++;
            data.next();
        } else {
            break;
        }
    }
    data.next();
    return {
        type: "title",
        data: { level },
        rawData,
        macros: [],
        children: parseInlineBlocks(data)
    }
}

function parseFenceCode(data: Peek): Node {
    const rawData = data.rest();
    let fence = "";
    while (!data.end()) {
        if (data.peek() === "`") {
            fence += "`";
        } else {
            break;
        }
    }
    const lines = rawData.split("\n");
    if (lines[lines.length - 1] === fence) {
        throw "Fence end isn't equal to fence start"
    }
    const codetype = lines[0].replaceAll(fence, "");
    const code = lines.slice(1, -1).join("\n");
    return {
        type: "fenceCode",
        data: { code, codetype },
        macros: [],
        rawData,
        children: []
    };
}

function parseTable(data: Peek): Node {
    const rawData = data.rest();
    const lines = rawData.split("\n");
    const splitR = /(?<!\\)\|/g;
    const trimR = /^\||\|$/g;
    const headers: Node = {
        type: "tableHeader",
        data: null,
        rawData: lines[0],
        macros: [],
        children: lines[0].replaceAll(trimR, "").split(splitR).map(h => {
            return {
                type: "tableField",
                data: null,
                rawData: h,
                macros: [],
                children: parseInlineBlocks(new Peek(h))
            };
        })
    };
    const colcnt = headers.children.length;
    if (lines.length < 2) {
        throw `Not found table align in ${rawData}`;
    }
    const align = lines[1].replaceAll(trimR, "").split(splitR).map(a => {
        switch (a) {
            case "-":
                return "none";
            case ":-":
                return "left";
            case "-:":
                return "right";
            case ":-:":
                return "center";
            default:
                throw `${a} is not vaild value of column align`;
        }
    });
    if (align.length !== colcnt) {
        throw "Table align count not equal to header";
    }
    const contents: Node[] = lines.slice(2).map(l => {
        return {
            type: "tableRow",
            data: null,
            rawData: l,
            macros: [],
            children: l.replaceAll(trimR, "").split(splitR).map(f => {
                return {
                    type: "tableField",
                    data: null,
                    rawData: f,
                    macros: [],
                    children: parseInlineBlocks(new Peek(f))
                };
            })
        };
    });
    return {
        type: "table",
        data: { align },
        rawData: rawData,
        macros: [],
        children: [headers, ...contents]
    }
}



function parseInlineBlocks(data: Peek, waitsign?: "*" | "**" | "***"): Node[] {
    let nodes: Node[] = [];
    let textBuf: string[] = [];
    let rawData: string[] = [];
    let lastMacro: MacroCall[] = [];
    function pushText() {
        if (textBuf.length != 0) {
            nodes.push({
                type: "text",
                data: { text: textBuf.join("") },
                rawData: rawData.join(""),
                macros: lastMacro,
                children: []
            });

            textBuf = [];
            rawData = [];
            lastMacro = [];
        }
    }

    function pushNode(node: Node) {
        node.macros.push(...lastMacro);
        lastMacro = [];
        nodes.push(node);
    }

    let afterSpace = false;
    while (!data.end()) {
        if (!afterSpace && (
            (waitsign === "*" && /^\*(?!\*)|^\*{3}/.test(data.peek(0, 3))) ||
            (waitsign === "**" && data.peek(0, 2) === "**") ||
            (waitsign === "***" && data.peek(0, 1) === "*")
        )) {
            pushText();
            return nodes;
        }
        afterSpace = false;
        switch (data.peek()) {
            case "*": {
                if (/^(\*{1,3}(?![ *]))/.test(data.peek(0, 4))) {
                    pushText();
                    pushNode(parseEmphasisAndStrong(data));
                } else {
                    textBuf.push("*");
                    rawData.push("*");
                    data.next();
                }
                break;
            }
            case "`": {
                pushText();
                pushNode(parseInlineCode(data));
                break;
            }
            case "[": {
                pushText();
                pushNode(parseLink(data));
                break;
            }
            case "!": {
                if (data.peek(1) === "[") {
                    pushText();
                    pushNode(parseImage(data));
                } else {
                    textBuf.push("!");
                    rawData.push("!");
                    data.next();
                }
                break;
            }
            case ":": {
                const cap = Regexs.emoji.exec(data.rest());
                if (cap && waitsign) {
                    const emojiName = cap[1];
                    data.next(cap[0].length);
                    pushText();
                    pushNode({
                        type: "emoji",
                        data: { name: emojiName },
                        rawData: cap[0],
                        macros: [],
                        children: []
                    });
                } else {
                    textBuf.push(":");
                    rawData.push(":");
                    data.next();
                }
                break;
            }
            case "<": {
                if (data.peek(0, 4) === "<!M ") {
                    pushText();
                    lastMacro = parseMacroCall(data);
                } else {
                    textBuf.push("<");
                    rawData.push("<");
                    data.next();
                }
                break;
            }
            case "\\": {
                if (Regexs.escape.test(data.peek(1))) {
                    textBuf.push(data.peek(1));
                    rawData.push(data.peek(0, 2));
                    data.next(2);
                } else {
                    textBuf.push("\\");
                    rawData.push("\\");
                    data.next();
                }
                break;
            }
            case " ": {
                afterSpace = true;
                textBuf.push(" ");
                rawData.push(" ");
                data.next();
                break;
            }
            default: {
                textBuf.push(data.peek());
                rawData.push(data.peek());
                data.next();
                break;
            }
        }
    }

    pushText();
    return nodes;
}

function parseMacroCall(data: Peek): MacroCall[] {
    if (Regexs.macrocall.test(data.rest())) {
        let macros: MacroCall[] = [];
        while (!data.end()) {
            const cap = Regexs.macrocall.exec(data.rest());
            if (cap) {
                data.next(cap[0].length);
                macros.push({
                    name: cap[1],
                    args: cap[2].split(",")
                })
            } else {
                break;
            }
        }
        return macros;
    } else {
        throw "not found macro call";
    }
}

function parseEmphasisAndStrong(data: Peek): Node {
    const cap = /^(\*{1,3}(?![ *]))/.exec(data.peek(0, 4));
    let starcnt = 0;
    let starstr;
    if (cap) {
        starcnt = cap[1].length;
        starstr = cap[1];
        data.next(starcnt);
    } else {
        throw "not found emphasis or strong";
    }
    let nodes: Node[] = [];
    nodes.push(...parseInlineBlocks(data, starstr as "*" | "**" | "***"));
    const cap2 = /^\*{1,2}/.exec(data.peek(0, 2));
    if (cap2) {
        const needstarcnt = Math.min(starcnt, cap2[0].length);
        const reststarcnt = starcnt - needstarcnt;
        data.next(needstarcnt);
        if (reststarcnt === 0) {
            const star = starcnt === 1 ? "*" : "**"
            return {
                type: starcnt === 1 ? "emphasis" : "strong",
                data: null,
                macros: [],
                children: nodes,
                rawData: star + nodes.map(n => n.rawData).join("") + star
            };
        } else if (reststarcnt === 1) {
            const snode: Node = {
                type: "strong",
                data: null,
                macros: [],
                children: nodes,
                rawData: "**" + nodes.map(n => n.rawData).join("") + "**"
            };
            const rnode = parseInlineBlocks(data, "*");
            data.next(1);
            return {
                type: "emphasis",
                data: null,
                macros: [],
                children: [snode, ...rnode],
                rawData: "*" + snode.rawData + rnode.map(n => n.rawData).join("") + "*"
            };
        } else if (reststarcnt === 2) {
            const enode: Node = {
                type: "emphasis",
                data: null,
                macros: [],
                children: nodes,
                rawData: "*" + nodes.map(n => n.rawData).join("") + "*"
            };
            const rnode = parseInlineBlocks(data, "**");
            data.next(2);
            return {
                type: "strong",
                data: null,
                macros: [],
                children: [enode, ...rnode],
                rawData: "**" + enode.rawData + rnode.map(n => n.rawData).join("") + "**"
            };
        } else {
            throw "parse em&strong internal error, unreachable";
        }
    } else {
        throw "not found emphasis or strong end";
    }
}

function parseInlineCode(data: Peek): Node {
    if (data.peek() !== "`") {
        throw "inline code should warpped in `";
    }

    let fence = "";
    let code = "";
    while (!data.end()) {
        switch (data.peek()) {
            case "`": {
                if (data.peek(0, fence.length) === fence) {
                    return {
                        type: "inlineCode",
                        data: { code: code.replaceAll(/^ | $/g, "") },
                        macros: [],
                        rawData: fence + code + fence,
                        children: []
                    };
                }
            }
            default: {
                code += data.peek();
            }
        }
    }

    throw `not found inline code end ${fence}`;
}

function parseLink(data: Peek): Node {
    const cap = Regexs.link.exec(data.rest());
    if (cap) {
        data.next(cap[0].length);
        return {
            type: "link",
            data: { name: cap[1], url: cap[2] },
            macros: [],
            rawData: cap[0],
            children: []
        };
    } else {
        throw "not found link, do you need escape \\[ ?";
    }
}

function parseImage(data: Peek): Node {
    if (data.peek(0, 2) !== "![") {
        throw "not found image";
    }
    data.next();
    const node = parseLink(data);
    if (node.type !== "link") {
        throw "parser error";
    }
    return {
        type: "image",
        data: { alt: node.data.name, url: node.data.url },
        rawData: node.rawData,
        macros: [],
        children: []
    };
}

export {
    parseSingle,
}