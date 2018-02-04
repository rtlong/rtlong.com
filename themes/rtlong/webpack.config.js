const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
    entry: [
        './javascript/main',
        './styles/main.sass',
    ],

    output: {
        path: path.join(__dirname, 'static', 'assets', '[hash]'),
        publicPath: 'assets/[hash]/',
        filename: '[name].js',
        chunkFilename: '[id].[hash].js'
    },

    plugins: [
        // new webpack.NoErrorsPlugin(),
      new AssetsPlugin({ filename: 'webpack.json', path: path.join(__dirname, '..', '..', 'data') }), // emit webpack-assets.json file for Hugo template
        new ExtractTextPlugin('[name].css'),
    ],

    module: {
        loaders: [
            { test: /\.css$/, loader: ExtractTextPlugin.extract('css')  },
            { test: /\.sass$/, loader: ExtractTextPlugin.extract('style', 'css!sass')  },
        ],
    },
}
