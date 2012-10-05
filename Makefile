all: public/javascripts/script.js

COMPONENT_FILES := index.js dateformat.js overlay.js preview.js

build/build.js: components $(COMPONENT_FILES)
	@./node_modules/.bin/component build --dev

components:
	@./node_modules/.bin/component install --dev

public/javascripts/script.js: build/build.js
	mkdir -p public/javascripts
	cp build/build.js public/javascripts/script.js

clean:
	rm -fr build components

.PHONY: clean
