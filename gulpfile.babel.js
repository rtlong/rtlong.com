// eslint indent: off //

import path from 'path'
import { spawn } from 'child_process'

import kexec from 'kexec'
import vnuJar from 'vnu-jar'
import through2 from 'through2'
import chalk from 'chalk'
import BrowserSync from 'browser-sync'
import gulp, { task, src, dest, series, parallel, watch } from 'gulp'

// Gulp plugins
import babel from 'gulp-babel'
import postcss from 'gulp-postcss'
import sourcemaps from 'gulp-sourcemaps'
import stylelint from 'gulp-stylelint'
import gulpHash from 'gulp-hash'
import gulpHtmlValidator from 'gulp-html-validator'
import gulpFilter from 'gulp-filter'
import gulpHtmlMin from 'gulp-htmlmin'
import gulpRev from 'gulp-rev'
import gulpCached from 'gulp-cached'
import gulpEslint from 'gulp-eslint'
import gulpPrint from 'gulp-print'

// PostCSS plugins
import cssnano from 'cssnano'
import postcssCssnext from 'postcss-cssnext'
import postcssImport from 'postcss-import'

const browserSync = BrowserSync.create()

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
    .pipe(gulpRev())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.dist))
    .pipe(gulpRev.manifest({
      path: paths.assetManifest,
      merge: true,
    }))
    .pipe(dest('.'))
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
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(gulpRev())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.dist))
    .pipe(gulpRev.manifest({
      path: paths.assetManifest,
      merge: true,
    }))
    .pipe(dest('.'))
})

task('js:vendored', function jsVendored() {
  return src(patterns.jsVendored)
    .pipe(gulpRev())
    .pipe(dest(paths.dist))
    .pipe(gulpRev.manifest({
      path: paths.assetManifest,
      merge: true,
    }))
    .pipe(dest('.'))
})

task('static', function jsVendored() {
  return src(patterns.static)
    .pipe(dest(paths.dist))
    .pipe(gulpRev())
    // .pipe(browserSync.stream())
    .pipe(dest(paths.dist))
    .pipe(gulpRev.manifest({
      path: paths.assetManifest,
      merge: true,
    }))
    .pipe(dest('.'))
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
  let filterHtml = gulpFilter('**/*.html')
  return src(patterns.hugoOut)
    .pipe(dest(paths.dist))
    .pipe(filterHtml)
    // .pipe(browserSync.stream())
    .pipe(gulpHtmlMin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      removeEmptyAttributes: true,
      removeComments: true
    }))
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
        parallel('js', 'js:vendored')) // eslint here too?

  watch([patterns.static],
        parallel('static'))

  watch(patterns.hugoInputs,
        parallel('hugo:build'))

  watch(patterns.hugoOut, { delay: 500 },
        parallel('hugo:post'))

  watch(patterns.public,
        parallel('browsersync:reload', 'validateHtml'))

  watch([patterns.gulp, patterns.node],
        parallel('gulp:restart'))

  done()
})

// TODO: robots.txt is clobbered back and forth by 'static' and 'hugo:build'
// TODO: gulp's and hugo's compiling in-progress and error messages in browser

task('build', series(
  parallel(
    'css',
    'css:lint'
  ),
  'js',
  'js:vendored',
  'static',
  'hugo:build',
  'hugo:post',
  'validateHtml'
))

task('default', series(
  parallel(
    'build',
    'browsersync:start'
  ),
  'browsersync:seedCache',
  'watch'))


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
