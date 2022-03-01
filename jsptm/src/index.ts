import { parseSingle } from "./parser";
import { node2html } from "./render";

const html = node2html(parseSingle("# *bb*"));
console.log(html);