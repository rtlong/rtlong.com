var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: [
    "./javascript/main.js",
    'bootstrap-sass!./config/bootstrap-sass.config.js'
  ],
  output: {
    path: __dirname + "/public",
    filename: "bundle.js",
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.sass/,
        loader: ExtractTextPlugin.extract([
          'css?sourceMap',
          'sass?indentedSyntax&sourceMap'
        ].join('!')),
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
      },

      // **IMPORTANT** This is needed so that each bootstrap js file required by
      // bootstrap-webpack has access to the jQuery object
      { test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery' },

      // Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
        // loads bootstrap's css.
        { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,   loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,  loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&mimetype=image/svg+xml" }
    ]
  },
  plugins: [
    // extract inline css into separate 'styles.css'
    new ExtractTextPlugin('bundle-[name].css'),
  ]
}
