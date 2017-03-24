import remark from "remark"
import retext from "retext"
import rmAutolinkheadings from "remark-autolink-headings"
import rmHighlight from "remark-highlight.js"
import rmHtml from "remark-html"
import rmLint from "remark-lint"
import rmRetext from "remark-retext"
import rmSlug from "remark-slug"
import rmTextr from 'remark-textr'
import rtEmoji from "retext-emoji"
// import rtEquality from "retext-equality"
// import rtIntensify from "retext-intensify"
// import rtKeywords from "retext-keywords"
// import rtOveruse from "retext-overuse"
// import rtReadability from "retext-readability"
// import rtSentiment from "retext-sentiment"
// import rtSimplify from "retext-simplify"
// import rtSmartypants from "retext-smartypants"
import typoEllipses from "typographic-ellipses"
import typoQuotes from "typographic-quotes"
import typoSpaces from "typographic-single-spaces"
import typoArrows from "typographic-arrows"
import typoApostrophes from "typographic-apostrophes"
import typoApostrophesPossessivePlurals from "typographic-apostrophes-for-possessive-plurals"
import vFileReporter from "vfile-reporter"

const retextOptions = {
}

const remarkOptions = {
  commonmark: true,
}

const rtDebug = () => {
  const ppNode = (node, indent='') => {
    console.log(`${indent}[${node.type}] value=${JSON.stringify(node.value)}`)
    if(!node.children) { return }
    node.children.forEach(child => ppNode(child, indent + '  '))
  }

  return (node) => {
    ppNode(node)
    return node
  }
}

export default (text) => {
  const retextProcessor = retext()
        .use(rtEmoji, {
          convert: "encode",
        })

  const remarkProcessor = remark()
        // .use(rmRetext, retextProcessor)
        .use(rmSlug)
        // .use(rmAutolinkheadings, {
        //   attributes: {},
        //   template: "#",
        // })
        .use(rmTextr, { plugins: [
          typoSpaces,
          typoEllipses,
          typoApostrophes,
          typoQuotes,
          typoApostrophesPossessivePlurals,
        ] })
        .use(rmHighlight)
        .use(rmHtml, {
          entities: "escape",
        })

  const retextedText = retextProcessor.process(text, retextOptions)
  if (retextedText === null) {
    console.log({ text, retextedText })
    throw "Retext processing returned null -- async?"
  }

  // var vfile = new VFile({
  //   'directory': this.context,
  //   'filename': path.relative(this.context, this.resource),
  //   'extension': path.extname(this.resource),
  //   'contents': text,
  // })

  const html = remarkProcessor.process(retextedText, remarkOptions, (err, htmlResult, fo) => {
    if (err) {
      throw(err)
    }
    if (htmlResult.messages.length > 0) {
      throw(vFileReporter(htmlResult) + "\n")
    }
    // console.log({ htmlResult, fo })
    // console.log(fo)
  })

  if (html === null) {
    console.log({ text, html })
    throw "Remark processing returned null -- async?"
  }

  return html
}
