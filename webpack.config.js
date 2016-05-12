var webpack = require('webpack')
var b = require('./build/banner')

module.exports = {
  content: __dirname,
  entry: './src/entry.js',
  output: {
    path: __dirname + '/dist',
    filename: 'min.js',
    library: 'min',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: [
    new webpack.BannerPlugin(b.banner)
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ["transform-es2015-modules-commonjs"]
        }
      }
    ]
  }
}
