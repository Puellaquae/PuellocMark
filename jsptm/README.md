# JSPTM

JSPTM is a JS/TS implement for PuellocMark. 

**This package is unstable now. Please always use the latest version first.**

## Usage

```js
import { PuellocMark } from "jsptm"
const html = PuellocMark(src, "html", macro, forcedMacroCalls)

// or

import { Ptm } from "jsptm"
const html = Ptm.parse(src)
                .applyMacro(marcos, forcedMacroCalls)
                .render("html")

```
