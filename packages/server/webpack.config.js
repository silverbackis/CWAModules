const path = require('path')

module.exports = [
  {
    mode: 'production',
    entry: {
      index: ['@babel/polyfill', path.resolve('./src/index.js')]
    },
    output: {
      path: path.resolve('./dist/'),
      filename: '[name].js',
      sourceMapFilename: '[name].map',
      libraryTarget: 'commonjs2'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          },
          include: path.resolve('./'),
          exclude: [/node_modules/]
        }
      ]
    },
    externals: {
      axios: 'axios',
      'set-cookie-parser': 'set-cookie-parser'
    },
    resolve: {
      mainFields: ['module', 'main']
    },
    node: {
      fs: 'empty'
    }
  }
]
