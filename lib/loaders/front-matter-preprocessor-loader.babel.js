import path from 'path'
import fs from 'fs'

module.exports = function(input) {
    // console.warn({ 'front-matter-preprocessor': { input } })
    this.cacheable()

    var out = input.replace(/@@include\((.+?)\)/, (match, includePath, offset, string) => {
        // console.warn({ 'front-matter-preprocessor': { match: [match, includePath, offset, string] } })
        var resolvedPath = path.resolve(this.context, includePath)
        this.addDependency(resolvedPath)
        return fs.readFileSync(resolvedPath)
    })

    // console.warn({ 'front-matter-preprocessor': { out } })

    return out
}
