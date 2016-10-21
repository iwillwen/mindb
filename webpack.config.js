var webpack = require('webpack')
var b = require('./build/banner')

module.exports = {
  content: __dirname,
  entry: {
    min: './src/entry.js',
    'min.debug': './src/entry.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    library: 'min',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    sourceMapFilename: '[file].map'
  },
  plugins: [
    new webpack.BannerPlugin(b.banner),
    new webpack.optimize.UglifyJsPlugin({
      include: /min\.js$/,
      minimize: true
    })
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
  },
  devtool: 'source-map'
}
