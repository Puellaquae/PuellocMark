export const Regexs = {
    title: /^#{1,6} /,
    rootMacrocall: /^(\<\!M [A-Za-z_]*?(\([0-9A-Za-z_,\. ]*?\))?\>)+$/,
    macrocall: /^<!M ([A-Za-z0-9_]*?)(\((.*?)\))?>/,
    break: /^-{4,}$/,
    listIdf: /^(\- )|(\+ )|(\* )/,
    emoji: /^:([a-z_]*?):/,
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    link: /^!?\[(.*?)\]\((.*?)\)/,
};
