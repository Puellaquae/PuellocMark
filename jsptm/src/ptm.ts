import { LowAst } from "./ast";
import { getMetadata } from "./metadata";

class Lines {
    srclines: string[];
    lineIdx: number = 0;

    constructor(src: string) {
        this.srclines = src.replaceAll(/\r\n/g, "\n").split(/\n/);
    }

    nextLine(): string | null {
        if (this.lineIdx >= this.srclines.length) {
            return null;
        }
        return this.srclines[this.lineIdx++];
    }

    peekNextLine(): string | null {
        if (this.lineIdx >= this.srclines.length) {
            return null;
        }
        return this.srclines[this.lineIdx];
    }

    testAndSkipNextLine(pat: RegExp | string): boolean {
        if (typeof pat === "string") {
            if (this.peekNextLine() === pat) {
                this.nextLine();
                return true;
            }
            return false;
        } else {
            if (pat.test(this.peekNextLine() ?? "")) {
                this.nextLine();
                return true;
            }
            return false;
        }
    }
}

function ptm2lowAst(src: string): LowAst {
    let line = new Lines(src);
    const metadata = getMetadata(line);
    // getGlobalMacro
    // getTitle
    // splitRootBlock
}

export { Lines, ptm2lowAst };