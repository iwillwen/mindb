../node_modules/.bin/babel --presets es2015 -d ./dist --ignore index.js --plugins transform-es2015-modules-umd ./src
cp ./src/index.js ./dist
cp ../dist/min.js ./libs
karma start karma.conf.js && karma run --
../node_modules/.bin/mocha ./dist/min.*.js
rm -rf dist
