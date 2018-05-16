// eslint indent: off //

import path from 'path'
import { spawn } from 'child_process'

import merge2 from 'merge2'
import split2 from 'split2'
import vnuJar from 'vnu-jar'
import through2 from 'through2'
import chalk from 'chalk'
import BrowserSync from 'browser-sync'
import gulp, { task, src, dest, series, parallel, watch } from 'gulp'
import fontawesome from '@fortawesome/fontawesome'
import faSolid from '@fortawesome/fontawesome-free-solid'
import faBrands from '@fortawesome/fontawesome-free-brands'

// Gulp plugins
import babel from 'gulp-babel'
import postcss from 'gulp-postcss'
import sourcemaps from 'gulp-sourcemaps'
import stylelint from 'gulp-stylelint'
import gulpCached from 'gulp-cached'
import gulpEslint from 'gulp-eslint'
import gulpFilter from 'gulp-filter'
import gulpHash from 'gulp-hash'
import gulpHtmlMin from 'gulp-htmlmin'
import gulpHtmlValidator from 'gulp-html-validator'
import gulpIf from 'gulp-if'
import gulpPlumber from 'gulp-plumber'
import gulpPrint from 'gulp-print'
import gulpReplace from 'gulp-replace'
import gulpRev from 'gulp-rev'
import del from 'del'
import gulpCheerio from 'gulp-cheerio'

// PostCSS plugins
import cssnano from 'cssnano'
import postcssCssnext from 'postcss-cssnext'
import postcssImport from 'postcss-import'

const browserSync = BrowserSync.create()

const assetManifest = {}

fontawesome.library.add(faBrands, faSolid)

const paths = {
  hugoOut: 'tmp/hugo-out/',
  dist: 'public/',
  dataDir: 'data',
}
paths.assetManifest = path.join(paths.dataDir, 'assets.json')

const patterns = {
  css: ['css/**/*.css'],
  js: [
    'js/**/*.js',
    '!js/vendor{,/**}',
  ],
  jsVendored: ['js/vendor/**/*.js'],
  hugoInputs: [
    'config.*',
    'content/**/*',
    'i18n/**/*',
    'layouts/**/*',
    'data/*.json',
    'data/resume/*.yml',
  ],
  gulp: [
    __filename,
  ],
  node: [
    '/node_modules/*/',
    'package.json',
    'package-lock.json',
  ],
  static: ['static/**/*'],
  public: [path.join(paths.dist, '/**/*')],
  publicHtml: [path.join(paths.dist, '/**/*.html')],
  hugoOut: [path.join(paths.hugoOut, '/**/*')],
  hugoOutHtml: [path.join(paths.hugoOut, '/**/*.html')],
}

task('gulp:die', function gulpRestart() {
  console.log('Gulpfile or node_modules changed. Gulp exiting.')
  process.exit(0)
})

task('browsersync:start', function browserSyncStart(done) {
  browserSync.init({
    server: paths.dist,
    logConnections: true,
    open: false,
  }, done)
})

task('browsersync:seedCache', function browserSyncReload() {
  return src(patterns.public)
    .pipe(gulpCached('browsersync'))
})

task('browsersync:reload', function browserSyncReload() {
  return src(patterns.public)
    .pipe(gulpCached('browsersync'))
    .pipe(gulpFilter(f => !f.isDirectory()))
    .pipe(browserSync.stream())
})

task('css', function css() {
  var postcssPlugins = [
    postcssImport,
    postcssCssnext({
      features: {
        customProperties: false,
      },
    }),
  ]

  if (isDeployment()) {
    postcssPlugins.push(cssnano({
      preset: 'default',
      safe: true,
    }))
  }

  return src(patterns.css)
    .pipe(sourcemaps.init())
    .pipe(postcss(postcssPlugins))
    .pipe(gulpIf(isDeployment, gulpRev()))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.dist))
    .pipe(collectGulpRevManifest(assetManifest))
})

task('css:lint', function csslint() {
  return src(patterns.css)
    .pipe(stylelint({
      reporters: [
        {
          formatter: 'string',
          console: true
        },
      ],
      failAfterError: false,
    }))
})

task('js', function js() {
  return src(patterns.js)
    .pipe(gulpPlumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(gulpIf(isDeployment, gulpRev()))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.dist))
    .pipe(collectGulpRevManifest(assetManifest))
})

task('js:lint', function jsLint() {
  return src(patterns.js)
    .pipe(gulpEslint())
    .pipe(gulpEslint.format())
})

task('js:vendored', function jsVendored() {
  return src(patterns.jsVendored)
    .pipe(gulpIf(isDeployment, gulpRev()))
    .pipe(dest(paths.dist))
    .pipe(collectGulpRevManifest(assetManifest))
})

task('static', function jsVendored() {
  return src(patterns.static)
    .pipe(dest(paths.dist))
    .pipe(gulpIf(isDeployment, gulpRev()))
    .pipe(dest(paths.dist))
    .pipe(collectGulpRevManifest(assetManifest))
})

task('hugo:clean', function clean() {
  return del(paths.hugoOut)
})

task('hugo:build', function hugoBuild(done) {
  var args = [
    '--verbose',
    '--i18n-warnings'
  ]
  var baseURL = hugoBaseURL()
  if (baseURL) args = args.concat(['--baseURL', baseURL])

  browserSync.notify(`Building...`)

  let hugo = spawn('hugo', args, {
    env: hugoEnv(),
    stdio: ['ignore', 'pipe', 'inherit'],
  })

  hugo.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.red(`Hugo failed with code ${code}`))
      browserSync.notify(`<span style="color: red">Hugo failed with code ${code}</span><img src="data:image/gif;base64,ba2" onerror="console.error('Hugo failed with code ${code}');this.parentNode.removeChild(this);" />`, 30000)
    } else {
      browserSync.notify(`Built.`, 1000)
    }
    done()
  })

  hugo.stdout.pipe(split2()).on('data', line => {
    if (/^(ERROR|WARN) /.test(line)) console.log(line)
  })
})

task('hugo:post', function hugoPost() {
  let assetReplacer = gulpReplace(/"(?:__assets|asset:)\/(.+?)"/g, (match, path) => {
    let resolved = assetManifest[path] || path
    // console.log('asset :', path, '=>', resolved)
    return `"/${resolved}"`
  })

  let faReplacer = gulpCheerio(($, file, done) => {
    $('i[icon]').each((_, el) => {
      let $el = $(el)

      let [ familyName, iconName ] = $el.attr('icon').split('-', 2)
      let title = $el.attr('title')
      let text = $el.text()
      let fallback = text.trim.length > 0 ? text : title

      let params = {
        prefix: familyName,
        iconName,
      }
      let iconDefinition = fontawesome.findIconDefinition(params)
      if (iconDefinition) {
        let opts = {}
        if (title) opts.title = title
        $el.replaceWith(fontawesome.icon(iconDefinition, opts).html)
      } else if (fallback) {
        $el.replaceWith(fallback)
        console.warn('fa: Icon not found. Fallback used.', { params, fallback })
      } else {
        throw(new Error(`fontAwesome icon not found: ${JSON.stringify(params)}`))
      }
    })

    done()
  })

  let footnotes = gulpCheerio(($, file, done) => {
    $('main').each((_, section) => {
      let links = new Map()
      let nextIdx = 0
      $('a[href]', section).each((index, el) => {
        let $el = $(el)
        let href = $el.attr('href')

        let $linkBodySpan = $el.find('span.link-body')

        if ($linkBodySpan.length === 0) {
          $el.html(`<span class="link-body">${$el.html()}</span>`)
          $linkBodySpan = $el.find('span.link-body')
        } else if ($linkBodySpan.length > 1) {
          console.warn('Nore than 1 span.link-body found in element:', $el)
          return
        }

        if ($el.hasClass('no-footnote') || href === $el.text().trim())
          return

        let idx
        if (links.has(href)) {
          idx = links.get(href)
        } else {
          idx = ++nextIdx
          links.set(href, idx)
        }

        $linkBodySpan.first()
          .after(`<sup class="footnote print-only" aria-hidden="true">${idx}</sup>`)
      })

      let footnotes = $('<ol class="footnotes print-only"></ol>')

      let linksA = Array.from(links.entries()).sort((a,b) => a[1] - b[1])
      linksA.forEach(([href, idx]) => {
        footnotes.append(`<li value="${idx}">${href}</li>`)
      })

      $(section).append('<hr>')
      $(section).append(footnotes)
    })
    done()
  })

  let filterHtml = gulpFilter('**/*.html', { restore: true })

  return src(patterns.hugoOut)
    .pipe(filterHtml)
    .pipe(assetReplacer)
    .pipe(faReplacer)
    .pipe(footnotes)
    .pipe(gulpIf(isDeployment, gulpHtmlMin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      removeEmptyAttributes: true,
      removeComments: true
    })))
    .pipe(filterHtml.restore)
    .pipe(dest(paths.dist))
})

const vnuPort = 8888
let vnuP = null
function vnuStart() {
  const readyRegex = /oejs.Server:main: Started/

  if (process.env.VNU_EXTERNAL) {
    return Promise.resolve(process.env.VNU_EXTERNAL)
  }

  vnuP = vnuP || new Promise((resolve, reject) => {
    const proc = spawn('java', ['-cp', vnuJar, 'nu.validator.servlet.Main', vnuPort], {
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let timeout = setTimeout(() => {
      reject(new Error('timed out waiting for Vnu to become ready'))
    }, 15000)

    process.on('exit', () => {
      console.log('Killing Vnu.jar')
      proc.kill()
    })

    proc.on('close', (code) => {
      console.log(`vnu.jar process exited with code ${code}`)
    })

    merge2([ proc.stdout, proc.stderr ])
      .pipe(split2())
      .on('data', line => {
        // console.log('VNU', line)
        if (readyRegex.test(line)) {
          clearTimeout(timeout)

          resolve(`http://localhost:${vnuPort}/`)
        }
      })
  })
  return vnuP
}

task('html:lint', async function validateHtml() {
  const validatorURL = await vnuStart()
  return src(patterns.publicHtml)
    .pipe(gulpHtmlValidator({ validator: validatorURL }))
    .pipe(validatorReport())
})

task('clean', function clean() {
  return del(paths.dist)
})

task('watch', function setupWatch(done) {
  watch([patterns.css, '.stylelintrc'],
        parallel('css', 'css:lint'))

  watch([patterns.js, patterns.jsVendored, '.babelrc'],
        parallel('js', 'js:vendored', 'js:lint'))

  watch([patterns.static],
        parallel('static'))

  watch(patterns.hugoInputs,
        series('hugo:clean', 'hugo:build', 'hugo:post', 'html:lint'))

  watch(patterns.public,
        parallel('browsersync:reload'), { delay: 500 })

  watch([patterns.gulp, patterns.node],
        parallel('gulp:die'))

  done()
})

// TODO: gulp's in-progress and error messages in browser

task('build', series(
  'clean',
  parallel(
    'css',
    'css:lint',
    'js',
    'js:vendored',
    'js:lint',
    'static',
    series(
      'hugo:clean',
      'hugo:build',
      'hugo:post',
      'html:lint'))))

task('default',
     parallel(
       'browsersync:start',
       series(
         'build',
         'browsersync:seedCache',
         'watch')))

/// Helpers ///

function hugoBaseURL() {
  if (isDev()) {
    return `http://0.0.0.0:3000`
  } else {
    return false

  }
}

function hugoEnv() {
  let env = Object.assign({}, process.env)
  if (isDev()) {
    env.DEV = '1'
  }
  if (isStaging()) {
    env.STAGING = '1'
  }
  return env
}

// if TRUE: this build targets *local* dev workflow; FALSE: build for deployment
function isDev() {
  return (process.env.NODE_ENV !== 'production')
}

// if TRUE: build targets staging; FALSE: build targets production
function isStaging() {
  return process.env.STAGING
}

// if TRUE: build targets a deployed scenario
function isDeployment() {
  return !isDev()
}

function validatorReport() {
  return through2.obj(function (file, encoding, callback) {
    const data = JSON.parse(file.contents.toString())
    // console.log(data)
    data.messages.forEach(msg => {
      console.log(chalk`{yellow ${path.relative(process.cwd(), file.path)}} {green ${msg.firstLine || ''}:${msg.lastLine || ''}} ${msg.message}`)
    })
    callback(null, file)
  })
}

// similar to gulpRev.manifest, but collects manifest in an object rather than a file
function collectGulpRevManifest(assetManifest) {
  return through2.obj(function (file, enc, cb) {
    // this transform is just a spy, always push throuhg the file:
    this.push(file)

    // Ignore all non-rev'd files
		if (!file.path || !file.revOrigPath) {
			cb()
			return
		}

    const revisionedFile = path.relative(file.base, file.path)
		const originalFile = path.join(path.dirname(revisionedFile), path.basename(file.revOrigPath))

    assetManifest[originalFile] = revisionedFile
    cb()
  })
}

process.on('uncaughtException', (err) => {
  console.err('uncaughtException', err)
})

process.on('SIGINT', () => {
  process.exit()
})
