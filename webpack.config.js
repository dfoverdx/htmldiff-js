const webpack = require('webpack');
const path = require('path');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        htmldiff: ['./src/Diff.js'],
    },

    output: {
        filename: 'htmldiff.min.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        library: 'HtmlDiff',
        libraryTarget: 'commonjs2'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(['dist']),
        new UnminifiedWebpackPlugin()
    ],

    optimization: {
        minimize: true
    }
};