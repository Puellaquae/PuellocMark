import TOML from '@ltd/j-toml';
import { Lines } from './ptm';

function getMetadata(lines: Lines): object {
    let toml = "";
    if (lines.testAndSkipNextLine("<!---")) {
        for (; ;) {
            if (lines.testAndSkipNextLine("--->")) {
                return TOML.parse(toml, { bigint: false });
            }
            toml += (lines.nextLine() + "\n");
        }
    }
    return {};
}

export { getMetadata }