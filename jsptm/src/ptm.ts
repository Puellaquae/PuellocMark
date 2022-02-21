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
}

export { Lines };