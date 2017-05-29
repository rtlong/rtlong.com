import path from 'path'
import webpack from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin'

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
        extractCSS: true,
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
        use: [
          'css-loader?minify&sourceMap'
        ].concat(loader),
        fallback: 'vue-style-loader?sourceMap'
      })
    }
    return [
      'vue-style-loader?sourceMap',
      'css-loader?sourceMap'
    ].concat(loader)
  }

  config() {
    let config = {
      entry: {
        build: './src/main.js',
      },

      output: {
        path: path.resolve(__dirname, './dist/'),
        publicPath: '/dist/',
        filename: this.dev ? '[name].js' : '[name].[hash].js',
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
                routing: routingLoader,
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
        ],
      },

      devServer: {
        historyApiFallback: true,
        host: '0.0.0.0',
        port: 8080,
        hot: true,
        inline: true,
        overlay: true,
        publicPath: '/dist/',
      },

      performance: {
        hints: this.dev ? false : 'warning',
        maxAssetSize: 500000,
      },

      devtool: this.dev ? 'cheap-module-source-map' : '#source-map',

      plugins: [
        new ExtractTextPlugin({
          filename: 'styles.css',
          allChunks: true,
          disable: !this.dev,
        }),
        new HtmlWebpackPlugin({
          title: 'RTLong',
          filename: 'index.html',
          template: 'node_modules/html-webpack-template/index.ejs',
          mobile: true,
          appMountId: 'app',
          inject: false,
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: function (module) {
            return module.context
              && module.context.indexOf('node_modules') !== -1;
          }
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest'
        }),
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          logLevel: 'warn',
        }),
        new webpack.HotModuleReplacementPlugin(),
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
