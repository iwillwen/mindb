node_modules/.bin/babel --presets es2015 -d test/dist --ignore index.js,min-browser.js --plugins transform-es2015-modules-umd test/src
mv test/dist/min-node.js test/dist/min.js
cp dist/min.js test/libs
node_modules/.bin/mocha test/dist/min.*.js
# rm -rf test/dist