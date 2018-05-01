const path = require('path');

module.exports = [
  {
    mode: 'production',
    entry: {
      routes: path.resolve(__dirname + '/src/routes.js'),
      refresh_jwt: path.resolve(__dirname + '/src/refresh_jwt.js'),
      utilities: path.resolve(__dirname + '/src/utilities.js')
    },
    output: {
      path: path.resolve(__dirname + '/dist/'),
      filename: '[name].js',
      libraryTarget: 'commonjs'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: __dirname,
          exclude: /node_modules/
        }
      ]
    },
    externals: {
      axios: 'axios',
      "set-cookie-parser": 'set-cookie-parser'
    }
  }
];
