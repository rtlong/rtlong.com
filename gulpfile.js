const path = require('path')
const { spawn } = require('child_process')

const kexec = require('kexec')
const vnuJar = require('vnu-jar')
const through2 = require('through2')
const chalk = require('chalk')

const gulp = require('gulp')
const { task, src, dest, series, parallel } = gulp

// Gulp plugins
const babel = require('gulp-babel')
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps')
const stylelint = require('gulp-stylelint')
const gulpHash = require('gulp-hash')
const gulpConnect = require('gulp-connect')
const gulpHtmlValidator = require('gulp-html-validator')
const gulpHtmlMin = require('gulp-htmlmin')

// PostCSS plugins
const cssnano = require('cssnano')
const postcssCssnext = require('postcss-cssnext')
const postcssImport = require('postcss-import')

const patterns = {
  assetManifest: 'data/assets.json',
  css: ['css/**/*.css'],
  js: ['js/**/*.js'],
  jsVendored: ['node_modules/livereload-js/dist/livereload.js'],
  hugo: [
    'config.*',
    'content/**/*',
    'layouts/**/*',
    'data/*.json',
    'data/resume/*.yml',
    'static/**/*',
    'asset-bundles/**/*',
  ],
  gulp: [
    'gulpfile.js',
  ],
  node: [
    '/node_modules/*/',
    'package.json',
    'package-lock.json',
  ],
  public: ['public/**/*'],
  publicHtml: ['public/**/*.html']
}

const watchers = new Set()
const readyWatchers = new Set()
// const watchedPaths = new Set()

function watchTask(name, patterns, tasks) {
  watchers.add(name)
  return task(name, () => {
    let w = gulp.watch(patterns, tasks)
    if (name !== 'watch-public') {
      w.on('change', f => console.log('CHANGE', name, f))
      w.on('unlink', f => console.log('UNLINK', name, f))
      w.on('add', f => console.log('CREATE', name, f))
    }
    w.on('ready', function () {
      // console.log(`ready from watcher: ${name}`)
      // let watched = this.getWatched()
      // for (let dir in watched) {
      //   watched[dir].forEach(f => {
      //     watchedPaths.add(path.relative(process.cwd(), path.join(dir, f)))
      //   })
      // }
      readyWatchers.add(name)
      for (let name of watchers.values()) {
        if (!readyWatchers.has(name)) return
      }
      console.log('ALL watchers are ready.')
      // fs.writeFileSync('watchedFiles.txt', Array.from(watchedPaths.values()).sort().join('\n'))
    })
    return w
  })
}

function liveReload() {
  return src(patterns.public)
    .pipe(gulpConnect.reload())
}

function gulpRestart() {
  console.log('Gulpfile or node_modules changed. Gulp restarting.')
  if (vnuPid) process.kill(vnuPid)
  kexec(process.argv0, process.argv.slice(1))
}

const serverOpts = {
  livereload: true,
  port: '1313',
  host: '0.0.0.0',
  root: 'public',
}

let livereload
function startServer(done) {
  let app = gulpConnect.server(serverOpts, () => {
    // exec(`open http://${serverOpts.host}:${serverOpts.port}`)
    done()
  })
  livereload = app.lr
  return app
}
task(startServer)

function css() {
  var plugins = [
    postcssImport,
    postcssCssnext({
      features: {
        customProperties: false,
      },
    }),
  ]

  if (!isDev()) {
    plugins.push(cssnano({
      preset: 'default',
      safe: true,
    }))
  }

  return src(patterns.css)
    .pipe(sourcemaps.init())
    .pipe(postcss(plugins))
    .pipe(gulpHash())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('asset-bundles/css/'))
    .pipe(gulpHash.manifest(patterns.assetManifest, {
      deleteOld: true,
      sourceDir: path.join(__dirname, 'asset-bundles/css/'),
    }))
    .pipe(dest('.'))
}
task(css)

function csslint() {
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
}
task(csslint)

function js() {
  return src(patterns.js)
      .pipe(gulpHash())
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('.'))
      .pipe(dest('asset-bundles/js/'))
      .pipe(gulpHash.manifest(patterns.assetManifest, {
        deleteOld: true,
        sourceDir: path.join(__dirname, 'asset-bundles/js/'),
      }))
      .pipe(dest('.'))
}
task(js)

function jsVendored() {
  return src(patterns.jsVendored)
    .pipe(dest('asset-bundles/js/vendor/'))
}
task(jsVendored)

function hugoBuild(done) {
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
      console.log(colors.red(`Hugo completed with code ${code}`))
    }
    done()
  })
}
task('hugoBuild',
     series(hugoBuild, htmlmin))

const vnuPort = 8888
let vnuPid = null
function startVnu(done) {
  if (vnuPid) return done()
  const ready = 'oejs.Server:main: Started'
  const proc = spawn('java', ['-cp', vnuJar, 'nu.validator.servlet.Main', vnuPort])
  vnuPid = proc.pid
  proc.on('close', (code) => {
    console.log(`vnu.jar process exited with code ${code}`)
  })
  proc.stderr.on('data', data => {
    // console.log(data.toString())
    if (data.includes(ready)) done()
  })
  proc.stdout.on('data', data => {
    // console.log(data.toString())
    if (data.includes(ready)) done()
  })
}
task(startVnu)

function validateHtml() {
  return src(patterns.publicHtml)
    .pipe(gulpHtmlValidator({
      validator: `http://localhost:${vnuPort}/`
    }))
    .pipe(validatorReport())
}
// task('validate', series(startVnu, validateHtml))
task('validate', validateHtml)

function htmlmin() {
  return src(patterns.publicHtml)
    .pipe(gulpHtmlMin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      removeEmptyAttributes: true,
      removeComments: true
    }))
    .pipe(dest('public/'))
}
task(htmlmin)

watchTask('watch-css',
          [patterns.css, '.stylelintrc'],
          series(
            css,
            csslint,
          ))

watchTask('watch-js',
          [patterns.js, patterns.jsVendored, patterns.node, '.babelrc'],
          parallel(
            js,
            jsVendored),
         )

watchTask('watch-hugo',
          patterns.hugo,
          series('hugoBuild'))

watchTask('watch-public',
          [patterns.public],
          parallel(
            liveReload,
            'validate',
          ))

watchTask('watch-gulp-restart',
          [patterns.gulp, patterns.node],
          gulpRestart)

task('build', series(
  parallel(
    css,
    js,
    jsVendored),
  'hugoBuild',
  'validate',
))

task('default',
     series(
       'build',
       parallel(
         startServer,
         // startVnu,
       ),
       parallel(
         'watch-js',
         'watch-css',
         'watch-hugo',
         'watch-public',
         'watch-gulp-restart')))

/// Helpers ///

function hugoBaseURL() {
  if (isDev()) {
    return `http://${serverOpts.host}:${serverOpts.port}`
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
