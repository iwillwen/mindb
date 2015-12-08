./node_modules/.bin/babel --presets es2015 build/_webpack.config.js > webpack.config.js
./node_modules/.bin/babel --presets es2015 build/banner.js > build/_banner.js
webpack
rm webpack.config.js
rm build/_banner.js
