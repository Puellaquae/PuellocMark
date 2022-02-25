import TOML from '@ltd/j-toml';
import { Node } from "./ast";
import { MacroCall } from './marco';

type Peekable<T> = {
    peek(): T | null,
    next(): T | null
}

class Peek<T> implements Peekable<T> {
    index = 0;
    content: T[];
    constructor(data: T[]) {
        this.content = data;
    }
    peek(): T | null {
        if (this.index >= this.content.length) {
            return null;
        }
        return this.content[this.index];
    }
    next(): T | null {
        if (this.index >= this.content.length) {
            return null;
        }
        return this.content[this.index++];
    }
    rest(): T[] {
        if (this.index >= this.content.length) {
            return [];
        }
        return this.content.slice(this.index);
    }
}

function parseRootBlock(rootBlock: string): Node {
    let chars = new Peek([...rootBlock]);
}

function parseMetadata(src: Peekable<string>): object {
    if (src.peek()?.startsWith("<!---\n") && src.peek()?.endsWith("\n--->")) {
        let next = src.next()!;
        return TOML.parse((next).replaceAll(/(<!--)|(--->)/, ""), { bigint: false });
    }
    return {};
}

function parseMacroCall(src: Peekable<string>): MacroCall[] {
    return [];
}

export { Peek, Peekable, parseRootBlock, parseMetadata, parseMacroCall }