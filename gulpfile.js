const { task, src, dest, series, watch, parallel } = require('gulp')

// Gulp plugins
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps')
const stylelint = require('gulp-stylelint')
const gulpHash = require('gulp-hash')

// PostCSS plugins
const colorguard = require('colorguard')
const postcssCssnext = require('postcss-cssnext')
const postcssImport = require('postcss-import')

const patterns = {
  css: 'css/**/*.css',
  js: 'js/**/*.js',
}

const css = () => {
  var plugins = [
    colorguard({
      threshold: 5,
    }),
    postcssImport,
    postcssCssnext({
      features: {
        customProperties: false,
      },
    }),
  ]

  return src(patterns.css)
    .pipe(gulpHash())
    .pipe(stylelint({
      reporters: [
        {
          formatter: 'string',
          console: true
        },
      ],
      failAfterError: false,
    }))
    .pipe(sourcemaps.init())
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('asset-bundles/css/'))
    .pipe(gulpHash.manifest('data/assets.json', {
      deleteOld: true,
      sourceDir: 'asset-bundles/css/',
    }))
    .pipe(dest('.'))
}

const js = () => src(patterns.js)
      .pipe(gulpHash())
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('.'))
      .pipe(dest('asset-bundles/js/'))
      .pipe(gulpHash.manifest('data/assets.json', {
        deleteOld: true,
        sourceDir: 'asset-bundles/js/',
      }))
      .pipe(dest('.'))

task(css)
task(js)

task('watch-css', () => watch([patterns.css, '.stylelintrc'], css))

task('watch-js', () => watch([patterns.js], js))

task('default',
     series(parallel('css', 'js'), parallel('watch-js', 'watch-css')))
