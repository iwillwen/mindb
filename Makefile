REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		-t 40000 \
		$(MOCHA_OPTS) \
		-R $(REPORTER)

test-cov:
	@rm -rf coverage.html
	@$(MAKE) test MOCHA_OPTS='--require blanket' REPORTER=html-cov > coverage.html
	@$(MAKE) test MOCHA_OPTS='--require blanket' REPORTER=travis-cov
	@ls -lh coverage.html

doc:
	@mkdir -p doc
	@./node_modules/.bin/doxmate -i . -o ./doc

.PHONY: test doc