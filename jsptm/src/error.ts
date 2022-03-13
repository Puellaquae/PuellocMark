import { NodeType } from "./ast";
import { Peek } from "./parser";

class UnreachableError extends Error {
    constructor() {
        super("Got into a unreachable branch");
        this.name = "Unreachable Error";
    }
}

class UnexpectedContentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Unexpected Content Error";
    }
}

class InvalidSyntaxError extends Error {
    constructor(target: NodeType | "macroCall", data: Peek, message?: string) {
        super(`Invaild syntax in parse ${target}${message ? (": " + message) : ""}. In ${data.peek(-10, 10)} ^ ${data.peek(0, 10)}`);
        this.name = "Invalid Syntax Error";
    }
}

export { UnreachableError, UnexpectedContentError, InvalidSyntaxError }