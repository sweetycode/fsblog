/**
 * @param content markdown data with frontmatter
 * @return {{frontmatter: string, markdown: string}}
 */
const jsYaml = require("js-yaml");
const {marked} = require("marked");

function splitFrontMatter(content) {
    let frontmatterPattern = /^---\s*\n(.*?)\n---\s*\n$/imsu
    let match = frontmatterPattern.exec(content)
    let frontmatter = '', markdown = content
    if (match != null) {
        frontmatter = match[1]
        markdown = content.substring(match[0].length)
    }
    return {frontmatter, markdown}
}

/**
 * @param frontMatter frontmatter content
 * @return {{}}
 */
function parseFrontMatter(frontmatter) {
    if (frontmatter.length == 0) {
        return {}
    }
    return jsYaml.load(frontmatter)
}


/**
 * @param markdown
 * @return {{summary: string, markdown: string, title: string}}
 */
function parseMarkdown(markdown) {
    let titlePattern = /(?:\s*\n)?# [ \t]*([^\n]+)\n/msu
    let morePattern = /\s+<!-- *more *-->\s+/imsu
    let summary = ''
    let title = ''

    let titleMatch = titlePattern.exec(markdown)
    if (titleMatch != null) {
        title = titleMatch[1]
        markdown = markdown.substring(titleMatch[0].length)
    }

    let moreMatch = morePattern.exec(markdown)
    if (moreMatch != null) {
        summary = render(markdown.substring(0, moreMatch.index))
    }
    return {title, summary, markdown}
}


function render(markdown) {
    return marked.parse(markdown)
}


/**
 *
 * @param content
 * @return {{summary: string, markdown: string}}
 */
function parse(content) {
    let {frontmatter, markdown: md} = splitFrontMatter(content)
    let attributes = parseFrontMatter(frontmatter)
    let {title, summary, markdown} = parseMarkdown(md)

    return {
        summary,
        markdown,
        title,
        ...attributes,
    }
}

exports.render = render
exports.parse = parse

