const {parse, render} = require("./parser");

const fs = require('fs')
const path = require('path')

const postsDirectory = 'posts';
const postsCacheFile = '.postscache';


/**
 * {
 *     slug: {
 *         path,
 *         date,
 *         summary,
 *         *category,
 *     }
 * }
 */
function scanPostDirectory() {
    let fileNames = fs.readdirSync(postsDirectory);
    let posts = {}
    fileNames.map(filename => {
        if (filename.startsWith('_') || filename.startsWith('.')) {
            return;
        }
        let date = null, slug = filename.replace(/.mdx?$/, '');
        let match = /(\d{4}-\d{1,2}-\d{1,2})_/.exec(filename)
        if (match) {
            date = match[1]
            slug = filename.substring(match[0].length).replace(/.mdx?$/, '')
        }

        let filepath = path.join(postsDirectory, filename)
        let content = fs.readFileSync(filepath, 'utf8')
        let {title, summary, category} = parse(content)

        posts[slug] = {
            slug,
            date,
            filepath,
            title,
            summary,
            //category,
        }
    })

    return posts
}

function loadAllPosts({invalidate} = {invalidate: false}) {
    if (!invalidate && fs.existsSync(postsCacheFile)) {
        return JSON.parse(fs.readFileSync(postsCacheFile))
    }

    let posts = scanPostDirectory()
    fs.writeFileSync(postsCacheFile, JSON.stringify(posts))
    return posts
}

exports.getAllPosts = function () {
    return loadAllPosts()
}

exports.getPostData = function (slug) {
    let postMeta = loadAllPosts()[slug]
    if (postMeta == null) {
        postMeta = loadAllPosts({invalidate: true})[slug]
    }
    if (postMeta == null) {
        throw new Error(`slug: "${slug}" not exists`);
    }

    let {markdown, ...attributes} = parse(fs.readFileSync(postMeta.filepath, 'utf8'))

    return {
        ...postMeta,
        ...attributes,
        html: render(markdown),
    }
}
