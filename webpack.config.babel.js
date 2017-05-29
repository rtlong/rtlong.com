import path from 'path'
import webpack from 'webpack'

class WebpackConfig {
  constructor() {
    this.rootDir = __dirname
    this.dir = __dirname // FIXME
    this.nodeModulesDir = path.join(__dirname, 'node_modules')
    this.dev = (process.env.NODE_ENV !== 'production')
    this.babelOptions = JSON.stringify({
      presets: ['env', 'vue-app'],
      babelrc: false,
      cacheDirectory: !!this.dev
    })
    this.options = {
      build: {
        extractCSS: null,
        postcss: null,
      },
    }
  }

  extractStyles() {
    return !this.dev && this.options.build.extractCSS
  }

  styleLoader(ext, loader = []) {
    if (this.extractStyles()) {
      return ExtractTextPlugin.extract({
        use: ['css-loader?minify&sourceMap'].concat(loader),
        fallback: 'vue-style-loader?sourceMap'
      })
    }
    return ['vue-style-loader?sourceMap', 'css-loader?sourceMap'].concat(loader)
  }

  config() {
    let config = {
      entry: './src/main.js',

      output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'build.js'
      },

      resolve: {
        alias: {
          '~': path.join(this.rootDir),
          '~static': path.join(this.rootDir, 'static'),
          '~assets': path.join(this.rootDir, 'assets'),
          '~plugins': path.join(this.rootDir, 'plugins'),
          '~store': path.join(this.dir, '.nuxt/store'),
          '~router': path.join(this.dir, '.nuxt/router'),
          '~pages': path.join(this.rootDir, 'pages'),
          '~components': path.join(this.rootDir, 'components')
        }
      },

      resolveLoader: {
        modules: [
          path.join(this.dir, 'node_modules'),
          this.nodeModulesDir,
        ]
      },

      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              postcss: this.options.build.postcss,
              loaders: {
                'js': 'babel-loader?' + this.babelOptions,
                'css': this.styleLoader('css'),
                'less': this.styleLoader('less', 'less-loader'),
                'sass': this.styleLoader('sass', 'sass-loader?indentedSyntax&?sourceMap'),
                'scss': this.styleLoader('sass', 'sass-loader?sourceMap'),
                'stylus': this.styleLoader('stylus', 'stylus-loader'),
                'styl': this.styleLoader('stylus', 'stylus-loader')
              },
              preserveWhitespace: false,
              extractCSS: this.extractStyles(),
            },
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
          },
          {
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?[hash]'
            }
          },
          {
            test: /\.css$/,
            use: this.styleLoader('css'),
          },
          {
            test: /\.less$/,
            use: this.styleLoader('less', 'less-loader'),
          },
          {
            test: /\.sass$/,
            use: this.styleLoader('sass', 'sass-loader?indentedSyntax&sourceMap'),
          },
          {
            test: /\.scss$/,
            use: this.styleLoader('sass', 'sass-loader?sourceMap'),
          },
          {
            test: /\.styl(us)?$/,
            use: this.styleLoader('stylus', 'stylus-loader'),
          },
        ],
      },

      devServer: {
        historyApiFallback: true,
        noInfo: true
      },

      performance: {
        hints: false
      },

      devtool: '#eval-source-map'
    }


    if (process.env.NODE_ENV === 'production') {
      config.devtool = '#source-map'
      // http://vue-loader.vuejs.org/en/workflow/production.html
      config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"production"'
          }
        }),
        // new PrerenderSpaPlugin(
        //   path.join(__dirname, './dist'), // Absolute path to compiled SPA
        //   [ // List of routes to prerender
        //     '/',
        //   ]
        // ),
        new webpack.LoaderOptionsPlugin({
          minimize: true
        })
      ])
    }

    return config
  }
}


module.exports = (new WebpackConfig).config()
