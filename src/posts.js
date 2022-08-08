const {parse, render} = require("./parser");

const fs = require('fs')
const path = require('path')

const postsDirectory = 'posts';
const postsCacheFile = '.postscache';


function isProduction() {
    return 'production' == process.env.NODE_ENV
}

function cleanPostsCache() {
    fs.rmSync(postsCacheFile)
}


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
        let {title, summary, category, draft} = parse(content)

        category = category || null;
        draft = draft || null;

        posts[slug] = {
            slug,
            date,
            filepath,
            title,
            summary,
            draft,
            category,
        }
    })

    return posts
}

function loadAllPosts({invalidate} = {invalidate: false}) {
    if (!invalidate && fs.existsSync(postsCacheFile)) {
        return JSON.parse(fs.readFileSync(postsCacheFile))
    }

    let posts = scanPostDirectory()
    if (isProduction()) {
        posts = posts.filter(post => !post.draft)
    }
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


exports.getCategoryPosts = function (name) {
    let lowercaseName = name.toLowerCase()
    return Object.values(loadAllPosts()).filter(post => post.category && post.category.toLowerCase() == lowercaseName)
}


exports.preparePostsData = function () {
    if (isProduction()) {
        cleanPostsCache()
    }
}

exports.getAllTags = function () {
    let tags = {}
    loadAllPosts().map(({tags}) => {
        if (tags) {
            for (let tag of tags) {
                if (tag) {
                    tags[tag] = 0
                }
            }
        }
    })
    return Object.keys(tags)
}
