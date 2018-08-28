const path = require('path');

module.exports = [
  {
    mode: 'production',
    entry: {
      index: path.resolve(__dirname + '/src/index.js')
    },
    output: {
      path: path.resolve(__dirname + '/dist/'),
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
            presets: ['env']
          },
          include: __dirname,
          exclude: [/node_modules/]
        }
      ]
    },
    externals: {
      axios: 'axios',
      "set-cookie-parser": 'set-cookie-parser'
    },
    resolve: {
      mainFields: ["module", "main"]
    }
  }
];
