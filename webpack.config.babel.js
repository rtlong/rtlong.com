import path from 'path'
import webpack from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

const routingLoader = require.resolve('./webpack/routing-loader')

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
      entry: {
        build: './src/main.js',
      },

      output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: this.dev ? '[name].js' : '[name].[chunkHash].js',
      },

      resolve: {
        alias: {
          vue: 'vue/dist/vue.js',
          '~': path.join(this.rootDir),
          '~assets': path.join(this.rootDir, 'assets'),
          '~components': path.join(this.rootDir, 'components'),
          '~layouts': path.join(this.rootDir, 'layouts'),
          '~pages': path.join(this.rootDir, 'pages'),
          '~plugins': path.join(this.rootDir, 'plugins'),
          '~router': path.join(this.dir, '.nuxt/router'),
          '~static': path.join(this.rootDir, 'static'),
          '~store': path.join(this.dir, '.nuxt/store'),
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
                js: 'babel-loader?' + this.babelOptions,
                css: this.styleLoader('css'),
                routing: [routingLoader],
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
        hints: this.dev ? false : 'error',
        maxAssetSize: 500000,
      },

      devtool: this.dev ? 'cheap-module-source-map' : '#source-map',

      plugins: [
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: function (module) {
            // this assumes your vendor imports exist in the node_modules directory
            return module.context && module.context.indexOf('node_modules') !== -1;
          }
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest'
        }),
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        }),
      ],
    }

    if (!this.dev) {
      // http://vue-loader.vuejs.org/en/workflow/production.html
      config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"production"',
          }
        }),
        // new PrerenderSpaPlugin(
        //   path.join(__dirname, './dist'), // Absolute path to compiled SPA
        //   [ // List of routes to prerender
        //     '/',
        //   ]
        // ),
      ])
    }

    return config
  }
}

module.exports = function(env) {
  let config = new WebpackConfig(env)
  return config.config()
}
