var webpack = require('webpack')
var banner = require('./build/banner').banner

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
    new webpack.BannerPlugin(banner)//,
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // })
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ["transform-es2015-modules-commonjs"]
        }
      }
    ]
  }
}
