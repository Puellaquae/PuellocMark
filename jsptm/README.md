# JSPTM

JSPTM is a JS/TS implement for PuellocMark. 

**This package is unstable now. Please always use the latest version first.**

## Usage

```js
const jsptm = require("jsptm")
jsptm.PuellocMark(...)

// or

import { PuellocMark } from "jsptm"
PuellocMark(...)
```

```ts
declare function PuellocMark(
    src: string, out: "html", macros: { [name: string]: Macro }, forceMacro: string[]): {
    metadata: {};
    output: string;
};
```

