import { Node } from "./ast";
import { UnreachableError } from "./error";

function node2html(node: Node): string {
    const content = () => node.children.map(n => node2html(n)).join("");
    switch (node.type) {
        case "break":
            return "<hr/>";
        case "emoji":
            return `<span>${node.data.name}</span>`;
        case "emphasis":
            return `<em>${content()}</em>`;
        case "fenceCode":
            return `<pre><code class='codeblock' lang="${node.data.codetype}">${node.data.code.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</code></pre>`;
        case "rawHtml":
            return node.data.html;
        case "htmlTag":
            if (node.data.attr.length === 0) {
                return `<${node.data.tag}>${content()}</${node.data.tag}>`
            } else {
                const attrs = node.data.attr.map(({ key, val }) => key + "=\"" + val + "\"").join(" ");
                return `<${node.data.tag} ${attrs}>${content()}</${node.data.tag}>`
            }
        case "image":
            return `<img alt="${node.data.alt}" src="${node.data.url}"/>`;
        case "inlineCode":
            return `<code class='inlinecode'>${node.data.code.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</code>`;
        case "link":
            return `<a href="${node.data.url}">${node.data.name}</a>`;
        case "list":
            return `<ul>${content()}</ul>`;
        case "listItem":
            return `<li>${content()}</li>`;
        case "para":
            return `<p>${content()}</p>`;
        case "quote":
            return `<blockquote>${content()}</blockquote>`;
        case "strong":
            return `<strong>${content()}</strong>`;
        case "table":
            if (node.children[0].type !== "tableHeader") {
                throw "parser table internal error, unreachable! not table header";
            }
            let header = "";
            node.children[0].children.forEach((d, idx) => {
                if (d.type !== "tableField") {
                    throw "parser table internal error, unreachable! not table field";
                }
                if (idx >= node.data.align.length) {
                    throw "too much column";
                } else if (node.data.align[idx] !== "none") {
                    header += `<th align="${node.data.align[idx]}">${d.children.map(node2html).join("")}</th>`;
                } else {
                    header += `<th>${d.children.map(node2html).join("")}</th>`;
                }
            });
            const body = node.children.slice(1).map(r => {
                if (r.type !== "tableRow") {
                    throw "parser table internal error, unreachable! not table row";
                }
                let html = "<tr>";
                r.children.forEach((d, idx) => {
                    if (d.type !== "tableField") {
                        throw "parser table internal error, unreachable! not table field";
                    }
                    if (idx >= node.data.align.length) {
                        throw "too much column";
                    } else if (node.data.align[idx] !== "none") {
                        html += `<td align="${node.data.align[idx]}">${d.children.map(node2html).join("")}</td>`;
                    } else {
                        html += `<td>${d.children.map(node2html).join("")}</td>`;
                    }
                })
                html += "</tr>";
                return html;
            }).join("");
            return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
        case "tableRow":
            throw `table row shouldn't render itself, ${node.rawData}`;
        case "tableField":
            throw `table field shouldn't render itself, ${node.rawData}`;
        case "tableHeader":
            throw `table header shouldn't render itself, ${node.rawData}`;
        case "text":
            return `${node.data.text}`;
        case "title":
            return `<h${node.data.level}>${content()}</h${node.data.level}>`;
        case "void":
            return "";
        case "multinodes":
            return node.data.nodes.map(n => node2html({ ...n, macros: node.macros, children: node.children, rawData: node.rawData })).join("");
        case "forknodes":
            throw new UnreachableError("forknodes should not appeared in rendering");
        default:
            throw new UnreachableError(`unknown node ${node}`);
    }
}

export { node2html };
