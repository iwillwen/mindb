node_modules/.bin/babel --presets es2015 -d test/dist --ignore index.js,min-node.js --plugins transform-es2015-modules-umd test/src
mv test/dist/min-browser.js test/dist/min.js
cp dist/min.js test/libs
karma start test/karma.conf.js && karma run --
rm -rf test/dist