# JSPTM

JSPTM is a JS/TS implement for PuellocMark.

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

