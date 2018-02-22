// eslint indent: off //

import path from 'path'
import { spawn } from 'child_process'

import kexec from 'kexec'
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

task('gulp:restart', function gulpRestart() {
  console.log('Gulpfile or node_modules changed. Gulp restarting.')
  if (vnuPid) process.kill(vnuPid)
  kexec(process.argv0, process.argv.slice(1))
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

  if (!isDev()) {
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

task('hugo:build', function hugoBuild(done) {
  var args = []
  var baseURL = hugoBaseURL()
  if (baseURL) args = args.concat(['--baseURL', baseURL])

  browserSync.notify(`Building...`)
  // console.log('Running Hugo to regenerate the site.')
  // console.log('hugo', args.join(' '))

  let hugo = spawn('hugo', args, {
    env: hugoEnv(),
    stdio: 'inherit',
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
})

task('hugo:post', function hugoPost() {
  let assetReplacer = gulpReplace(/"(?:__assets|asset:)\/(.+?)"/g, (match, path) => {
    let resolved = assetManifest[path] || path
    // console.log('asset :', path, '=>', resolved)
    return `"/${resolved}"`
  })

  let faReplacer = gulpReplace(/%%icon:(fa\w*)-(\w+?)(?:\:(.+?))?%%/g, (match, familyName, iconName, fallback) => {
    let params = {
      prefix: familyName,
      iconName,
    }
    // console.log('fontAwesome replacer:', params)

    let icon = fontawesome.findIconDefinition(params)

    if (!icon && !fallback)
      throw(new Error(`fontAwesome icon not found: ${JSON.stringify(params)}`))

    return icon ? fontawesome.icon(icon).html : fallback
  })

  let filterHtml = gulpFilter('**/*.html', { restore: true })

  return src(patterns.hugoOut)
    .pipe(filterHtml)
    .pipe(faReplacer)
    .pipe(assetReplacer)
    .pipe(gulpIf(isDeployment(), gulpHtmlMin({
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
let vnuPid = null
// function startVnu(done) {
//   if (vnuPid) {
//     done()
//     return
//   }
//   const ready = 'oejs.Server:main: Started'
//   const proc = spawn('java', ['-cp', vnuJar, 'nu.validator.servlet.Main', vnuPort])
//   vnuPid = proc.pid
//   proc.on('close', (code) => {
//     console.log(`vnu.jar process exited with code ${code}`)
//   })
//   proc.stderr.on('data', data => {
//     if (data.includes(ready)) done()
//   })
//   proc.stdout.on('data', data => {
//     if (data.includes(ready)) done()
//   })
// }

task('validateHtml', function validateHtml() {
  return src(patterns.publicHtml)
    .pipe(gulpHtmlValidator({
      validator: `http://localhost:${vnuPort}/`
    }))
    .pipe(validatorReport())
})

task('watch', function setupWatch(done) {
  watch([patterns.css, '.stylelintrc'],
        parallel('css', 'css:lint'))

  watch([patterns.js, patterns.jsVendored, '.babelrc'],
        parallel('js', 'js:vendored', 'js:lint'))

  watch([patterns.static],
        parallel('static'))

  watch(patterns.hugoInputs,
        series('hugo:build', 'hugo:post', 'validateHtml'))

  watch(patterns.public,
        parallel('browsersync:reload'))

  watch([patterns.gulp, patterns.node],
        parallel('gulp:restart'))

  done()
})

// TODO: gulp's in-progress and error messages in browser

task('build', parallel(
    'css',
    'css:lint',
    'js',
    'js:vendored',
    'js:lint',
    'static',
    series(
      'hugo:build',
      'hugo:post',
      'validateHtml')))

task('default', parallel(
  'build',
  'watch',
  series(
    'browsersync:start',
    'browsersync:seedCache')))


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
