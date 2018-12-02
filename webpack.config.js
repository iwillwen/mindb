
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const b = require('./assets/banner')
const path = require('path')
const os = require('os')

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'min.js',
    library: 'min',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    sourceMapFilename: 'min.map'
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  mode: 'production',
  optimization: {
    usedExports: true,
    minimizer: [
      new UglifyJsPlugin({
        parallel: os.cpus().length,
        sourceMap: true
      })
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: b.banner
    })
  ]
}
