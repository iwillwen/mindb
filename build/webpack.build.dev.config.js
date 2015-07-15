import webpack from 'webpack'
import babel from 'babel-loader'
import banner from './_banner'

export default {
  entry: './src/min',
  output: {
    path: './dist',
    fiename: 'min-debug.js',
    library: 'min',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.BannerPlugin(banner)
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          stage: 0
        }
      }
    ]
  }
}