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
import gulpHtmlMin from 'gulp-htmlmin'

// PostCSS plugins
import cssnano from 'cssnano'
import postcssCssnext from 'postcss-cssnext'
import postcssImport from 'postcss-import'

const browserSync = BrowserSync.create()

const paths = {
  hugoOut: 'tmp/hugo-out/',
  dist: 'public/',
  assetManifest: 'data/assets.json',
}
paths.distJs = path.join(paths.dist, 'js')
paths.distCss = path.join(paths.dist, 'css')

const patterns = {
  css: ['css/**/*.css'],
  js: ['js/**/*.js'],
  jsVendored: ['js/vendor/**/*.js'],
  hugo: [
    'config.*',
    'content/**/*',
    'layouts/**/*',
    'data/*.json',
    'data/resume/*.yml',
    'static/**/*',
  ],
  gulp: [
    __filename
  ],
  node: [
    '/node_modules/*/',
    'package.json',
    'package-lock.json',
  ],
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
  })
  done()
})

task('browsersync:reload', function browserSyncReload() {
  return src(patterns.public)
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
    .pipe(gulpHash())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.distCss))
    .pipe(gulpHash.manifest(patterns.assetManifest, {
      deleteOld: true,
      sourceDir: path.join(__dirname, paths.distCss),
    }))
    // .pipe(dest('.'))
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
      .pipe(gulpHash())
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('.'))
      .pipe(dest(paths.distJs))
      .pipe(gulpHash.manifest(paths.assetManifest, {
        deleteOld: true,
        sourceDir: path.join(__dirname, paths.distJs),
      }))
      .pipe(dest('.'))
})

task('js:vendored', function jsVendored() {
  return src(patterns.jsVendored)
    .pipe(dest('public/js/vendor/'))
})

task('hugo:build', function hugoBuild(done) {
  var args = []
  var baseURL = hugoBaseURL()
  if (baseURL) args = args.concat(['--baseURL', baseURL])
  console.log('Running Hugo to regenerate the site.')
  console.log('hugo', args.join(' '))
  let hugo = spawn('hugo', args, {
    env: hugoEnv(),
    stdio: 'inherit',
  })
  hugo.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.red(`Hugo completed with code ${code}`))
    }
    done()
  })
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

task('hugo:post', function hugoPost() {
  return src(patterns.hugoOutHtml)
    .pipe(gulpHtmlMin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      removeEmptyAttributes: true,
      removeComments: true
    }))
    .pipe(dest(paths.dist))
})

task('watch', function setupWatch(done) {
       watch([patterns.css, '.stylelintrc'],
             series('css', 'css:lint'))

       watch([patterns.js, patterns.jsVendored, patterns.node, '.babelrc'],
             parallel('js', 'js:vendored')) // eslint here too?

       watch(patterns.hugo,
             parallel('hugo:build'))

       watch(patterns.public,
             parallel('browsersync:reload', 'validateHtml'))

       watch([patterns.gulp, patterns.node],
             parallel('gulp:restart'))

       done()
     })

task('build', series(
  parallel(
    'css',
    'js',
    'js:vendored'),
  'hugo:build',
  'validateHtml'
))

task('default', series(
  'build',
  'browsersync:start',
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
