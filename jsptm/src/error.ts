import { NodeType, Node } from "./ast";
import { MacroCall } from "./marco";
import { Peek } from "./parser";

class UnreachableError extends Error {
    constructor(message?: string) {
        super(`Internal Error. ${message}`);
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
        super(`Invaild syntax in parse ${target}${message ? (": " + message) : ""}. In ${data.peek(-20, 20)} ^ ${data.peek(0, 20)}`);
        this.name = "Invalid Syntax Error";
    }
}

class MacroApplyError extends Error {
    constructor(node: Node, marcoCall: MacroCall, rawError: Error) {
        super(`${marcoCall.name}(${marcoCall.arg}) throw ${rawError} applying ${node.rawData}`);
        this.name = "Macro Apply Error";
    }
}

export { UnreachableError, UnexpectedContentError, InvalidSyntaxError, MacroApplyError }