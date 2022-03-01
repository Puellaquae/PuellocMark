# Puelloc Tailored Markdown 规范

基于 [Github Flavored Markdown 规范](https://github.github.com/gfm)和 [CommonMark 规范](https://spec.commonmark.org/)修改而来，并根据 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 授权。

## 介绍

### 什么是 Puelloc Tailored Markdown？

Puelloc Tailored Markdown，可缩写为 PuellocMark 或 PTM，是 Markdown 的方言，专为 [Puellaquae.github.io](https://github.com/Puellaquae/Puellaquae.github.io) 设计服务。

PTM 与 CommonMark，GFM 为交集，仅保证文档直接在其他解析器中的呈现是可读的（不保证语义上的一致）。

## 字符和行 Char & Line

只有字符的特定排列才被视为有效的 PTM 文档。

字符是一个 Unicode 代码点，所有代码点都视为字符。不指定编码，但建议使用 UTF-8 作为文档的编码。

行由一串零个或多个字符和行结束符组成。

行结束符是换行（`U+000A`）、回车(`U+000D`)或回车换行，取决于操作系统。

出于安全原因，文档中不应出现字符 `U+0000`。

仅有行结束符组成的行视为空行。

空格为 `U+0020`。

空白为一个或多个空格组成。

ASCII 标点符号是 `!`，`"`，`#`，`$`，`%`，`&`，`'`，`(`，`)`，`*`，`+`，`,`，`-`，`.`，`/`（`U+0021–2F`），`:`，`;`，`<`，`=`，`>`，`?`，`@` （`U+003A–0040`），`[`，`\`，`]`，`^`，`_`，`` ` ``（`U+005B–0060`），`{`，`|`，`}`，`~`（`U+007B–007E`）。

## 块 Block

文档可视为连续的块，块可以包含其他块。块与块内容不允许交叉。

块分为四类，容器快，独立块和内联块。内联块必须被包含在独立块或其他内联块内，内联块不能包含独立块。独立块只能包含内联块。

独立块除 HTML，表格和围栏代码块外不可跨行。内联块均不可跨行。容器块均可跨行。

没有被包含在其他块中的块称为顶层块，每个顶层块结尾后有且仅有一个空行。

## 独立块 RootableBlock

### 分割线 Break

仅由 4 个或多个 `-` 字符（不允许包含其他字符）组成的行，形成分割线。

行首不允许有空白。

### 标题 Title

标题由开始序列和标题内容组成。开始序列为 1 至 6 个 `#` 和一个空格。标题内容首尾不能是空格。

行首不允许有空白。

### 围栏代码块 FenceCode

围栏由 3 个或以上的 `` ` ``组成，结束围栏和开始围栏的长度必须一致，开始围栏后可紧跟一段纯文字描述信息。

开始围栏和结束围栏所在行的行首不允许有空白。

代码块中的内容视为明文，将不会被解析处理。

### 表格 Table

表格是具有行和列的数据排列，由单个标题行、分隔符、将标题与数据分隔开的分隔符行，以及零个或多个数据行组成。

每行由包含任意文本的单元格组成，其中的内容由管道（`|`）分隔。需要前置和后置管道。管道和单元格内容之间的空白会被删除。

分隔符行由单元格组成，这些单元格的唯一内容是连字符（`-`），可选的前置或后置冒号（`:`）或两者兼有，分别表示左，右或中心对齐。

### 图片 Image

在链接前加上 `!` 即表示图片，其中链接文本作为 `alt` 属性。

### 段落 Para

无法被解析为其他块的内容按照段落解析。

### 引用 Quote

`> ` 和内联块。

## 内联块 InlineBlock

### 行内代码块 InlineCode

以一个或两个反引号字符`` ` ``开头，并以相同数量的反引号字符结尾。反引号字符串之间的内容，删除首尾一个空格后即为代码内容。规范要求不合并空白，由呈现者决定。代码内容视为明文，将不会被解析处理。

### 反斜杠转义 Escape

对于任何 ASCII 标点字符都可以用反斜杠转义来消除语法意义。

### 强调 Emphasis & Strong

一个 `*` 包住内容，使用 `<em>` 包装；两个 `**` 包住内容，使用 `<strong>` 包装。

定界符是一串 `*` ，前后没有 `*`。如果定界符一侧是 ASCII 标点符号，则另一侧必须是空格或行首行末。左侧定界符是右侧没有空白的定界符。右侧定界符是左侧没有空白的定界符。

- 单个 `*` 能开始强调，如果它是左侧定界符的部分。
- 单个 `*` 能结束强调，如果它是右侧定界符的部分。
- 两个 `*` 能开始着重强调，如果它是左侧定界符的部分。
- 两个 `*` 能结束着重强调，如果它是右侧定界符的部分。
- 强调以能开始强调的定界符开始，能结束强调的定界符结束，定界符字符一样。开始与结束定界符之间必须是非空内联块。
- 着重强调以能开始着重强调的定界符开始，能结束着重强调的定界符结束， 定界符字符一样。开始与结束定界符之间必须是非空内联块。
- `*` 不能出现在 `*` 强调或 `**` 着重强调的前后，除非用反斜杠转义。
- 嵌套层数应当最小。例如，解析为 `<strong>...</strong>` 要优于 `<em><em>...</em></em>`。
- 解析为 `<strong><em>...</em></strong>` 要优于 `<em><strong>..</strong></em>`。

### 链接 Link

格式为 `[` + 链接文本 + `]` + `(` + 链接地址 + `)`。

### Emoji

`:` + 描述 + `:` 的会被转换为相应的 emoji。

具体转换表参见[ikatyang/emoji-cheat-sheet](https://github.com/ikatyang/emoji-cheat-sheet)。

### 文本 Text

任何未通过上述规则解释的字符都将被解析为纯文本内容。

## 容器块 ContainerBlock

### 列表 List

在行首加上 `-`，`+` 或 `*` 和一个空格，并将此项内所有行的行首从第 3 个字符算起。从第一个 `-`，`+` 或 `*` 开始直到没有连续的（中间无空行）同层级的 `-`，`+` 或 `*`（同一列表需使用同一符号）为止。

每项可包含一个内联块或包含一个内联块和列表。

## 元数据 MetaData

元数据是特殊的独立块。

首行为 `<!---`（`<` + `!` + 三个 `-`），然后是数行元数据内容，结尾一行为 `--->`（三个 `-` + `>`）。元数据内容可为空，使用 TOML 格式。元数据必须位于文档首。文档最多只能有一个元数据，可以没有元数据。元数据可用于记录文档信息和需要向解析器传递的信息。

## 宏 Macro

宏作用于 AST 节点，生成新的 AST 节点。宏可以指定处理的 AST 节点的类型，若应用于指定的以外的类型的节点，宏将不生效。

宏的申明定义方式交由解析器决定。

宏使用格式为 `<!M ` + 宏名称 + 宏参数（可选） + `>`。宏名称区分大小写。宏参数使用括号 `(...)` 包裹。对于同时使用多个宏，用逗号 `,` 分割。

宏位于第一个顶层块前且有空行分割时，为全局使用。全局使用的效果等同于对每一个顶层块局部应用）。宏位于其他任意块前时，仅应用于紧跟那一块。如果宏要应用于顶层块，则需位于块前一行，且行首不能为空白。

全局使用的宏视为特殊的顶层块，一个文档只能有一个宏的全局使用块。

以下是一些可接受的宏使用方式：

```
一些内容<!M 宏 >要应用的块又一些内容

一些内容<!M 宏 ><!M 另些宏 >要应用的块又一些内容

<!M 宏 >
要应用的顶层块

<!M 宏 ><!M 另些宏 >
要应用的顶层块

<!M 宏 >
<!M 另些宏 >
要应用的顶层块
```

全局宏先于局部宏执行，层级深的语法宏先于层级浅的，同一层级位置前的先于位置后的。宏可以知道其他应用于此块及内部子块的宏的存在。

## 原始 HTML 内容

原始 HTML 内容只能有解析器生成，不能直接书写在文档中。

## EBNF

```ebnf
PTM = [ Metadata EmptyLine ] [ RootMacro EmptyLine ] { RootMacro RootBlock EmptyLine } 

Warp = "\r\n" | "\n"

EmptyLine = Warp

Metadata = "<!---" Warp [ TOML Warp ] "--->" Warp

RootMacro = { Macro { Macro } Warp }

Macro = "<M " { MacroCall "," } [ MacroCall ] ">" 

MacroCall = MacroName [ "(" { MacroArg "," } [ MacroArg ] ")" ]

RootBlock = ContainerBlock | ( RootableBlock Warp )

ContainerBlock = Quote | List

InlineBlocks = InlineBlock { InlineBlock }

Quote = "> " InlineBlocks Warp

List = { ( "- " | "+ " | "* " ) InlineBlocks [ RootMacro ( ContainerBlock | RootableBlock ) ] Warp }

RootableBlock = Break | Title | Para | FenceCode | Table

Break = "----" { "-" }

Title = "# " | "## " | "### " | "#### " | "##### " | "###### " InlineBlocks

Para = InlineBlocks

FenceCode = ( "`" FenceCode "`" ) | "``" CodeType Warp Code Warp "``"

Table = "|" { Header "|" } Warp "|" { ( "-" | ":-" | "-:" | ":-:" ) "|" } { Warp "|" { InlineBlocks "|" } }

InlineBlock = InlineCode | Emphasis | Strong | Emoji | Link | Text | Macro | Image

InlineCode = ( "``" Code "``" ) | ( "`" Code "`" )

Emphasis = "*" InlineBlocks "*"

Strong = "**" InlineBlocks "**"

Emoji = ":" EmojiName ":"

Link = "[" LinkName "]" "(" Url ")"

Image = "![" ImageAlt "]" "(" Url ")"

Del = "~" InlineBlock { InlineBlock } "~"

```
