hugo:
	hugo

webpack:
	webpack

clean:
	rm -rf public/*

forego:
	forego start

dev: clean forego

build: clean hugo webpack
