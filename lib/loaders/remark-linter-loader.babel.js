import path from 'path'

import remark from "remark"
import rmLint from "remark-lint"
import VFile from "vfile"

module.exports = function(input) {
  this.cacheable()
  var callback = this.async()

  var resourceRelativePath = path.relative(process.cwd(), this.resourcePath)
  var extname = path.extname(resourceRelativePath)
  var filenameWithoutExt = path.basename(resourceRelativePath)
      .slice(0, -extname.length)
  var vfile = new VFile({
    'directory': path.dirname(resourceRelativePath),
    'filename': filenameWithoutExt,
    'extension': extname.slice(1),
    'contents': input,
  })

  remark()
    .use(rmLint, {
      'no-consecutive-blank-lines': false,
      'maximum-line-length': false,
      'no-multiple-toplevel-headings': false,
      'definition-case': false,
      'list-item-indent': false,
    })
    .process(vfile, (err, result) => {
      if (err) { return callback(err) }

      result.messages.forEach(message => {
        this.emitWarning(message)
      })

      callback(null, input)
    })
}
