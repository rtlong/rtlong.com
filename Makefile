build: clean hugo webpack

dev: deps clean forego

hugo:
	hugo

webpack: deps
	node_modules/.bin/webpack

clean:
	rm -rf public/*

forego:
	forego start

deps:
	npm install
