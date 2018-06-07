'use strict';

module.exports = {
    entry: {
        pay: `${__dirname}/src/js/index.js`
    },
    output: {
        path: `${__dirname}/static/`,
        filename: 'index.js'
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                query: {
                    presets: ['es2015']
                }
            },
            {test: /\.css$/, loader: 'style-loader!css-loader'}
        ]
    },
    devServer: {
        host: '0.0.0.0',
        hot: true,
        open: true
    }
}