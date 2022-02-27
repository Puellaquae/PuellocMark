import TOML from '@ltd/j-toml';
import { Node } from "./ast";
import { MacroCall } from './marco';

class Peek {
    content: string[];
    index: number = 0;
    constructor(str: string) {
        this.content = [...str];
    }

    peek(offset: number = 0, len: number = 1): string {
        return this.content.slice(this.index + offset, this.index + offset + len).join();
    }

    next(len: number = 1): string {
        const ret = this.content.slice(this.index, this.index + len).join();
        this.index += len;
        return ret;
    }

    rest(): string {
        return this.content.slice(this.index).join();
    }

    end(): boolean {
        return this.index >= this.content.length;
    }
}

function parseRootBlock(data: Peek): Node {
    let macros: MacroCall[] = [];
    let node: Node;
    while (!data.end()) {
        if (data.peek(0, 4) === "<!M ") {
            macros.push(...parseMacroCall(data));
        } else if (data.peek() === "\n") {
            data.next();
            if (data.peek(0, 4) !== "<!M ") {
                throw "Macro should on itself line if applied on rooted block";
            }
        } else {
            break;
        }
    }
    if (data.end()) {
        throw "Data shouldn't only has macro call";
    }
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
            if (/^#{1, 6} /.test(data.peek(0, 7))) {
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
        throw "Data should be empty";
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
    if (/^-{4,}$/.test(rawData)) {
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
    if (!/(- )|(+ )|(* )/.test(listIdf)) {
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
    if (!/^#{1, 6} /.test(data.peek(0, 7))) {
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
        type: "tableRow",
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
                return "left";
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



function parseInlineBlocks(data: Peek): Node[] {
    let nodes: Node[] = [];
    let strbuf = "";

    for (const c of data.rest()) {
        
    }
}

function parseMacroCall(data: Peek): MacroCall[] {
    if (data.peek(0, 4) === "<!M ") {

    } else {
        return [];
    }
}

export {
    parseRootBlock,
}