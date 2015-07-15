babel build/webpack.build.prod.config.js > build/_webpack.build.prod.config.js
babel build/webpack.build.dev.config.js > build/_webpack.build.dev.config.js
babel build/banner.js > build/_banner.js
webpack --config build/_webpack.build.prod.config.js ./src/min.js ./dist/min.js
webpack --config build/_webpack.build.dev.config.js ./src/min.js ./dist/min-debug.js
rm build/_webpack.build.prod.config.js build/_webpack.build.dev.config.js
rm build/_banner.js