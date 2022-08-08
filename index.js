let {getAllPosts, getPostData, preparePostsData, getCategoryPosts} = require('./src/posts')


exports.getAllPosts = getAllPosts
exports.getPostData = getPostData
exports.preparePostsData = preparePostsData
exports.getCategoryPosts = getCategoryPosts

exports.getAllCategories = function() {
    return require.resolve(path.join(process.cwd(), 'lib/categories.js'))
}