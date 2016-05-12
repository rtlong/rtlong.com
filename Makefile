.PHONY: build
build: clean hugo webpack

.PHONY: dev
dev: deps clean forego

.PHONY: hugo
hugo:
	hugo

.PHONY: webpack
webpack: deps
	node_modules/.bin/webpack

.PHONY: clean
clean:
	rm -rf public/*

.PHONY: forego
forego:
	forego start

.PHONY: deps
deps:
	npm install

.PHONY: deploy-deps
deploy-deps:
	command -v aws > /dev/null 2>&1 || pip install awscli
	aws configure set preview.cloudfront true

./public/index.html:
	$(MAKE) hugo webpack

.PHONY: ensure-build
ensure-build: ./public/index.html

.PHONY: deploy-production
deploy-production: ensure-build deploy-deps
	aws s3 sync --delete ./public/ 's3://rtlong.com/production/'
	aws cloudfront create-invalidation --distribution-id E2TN83NW9MLEUM --paths '/*'

.PHONY: deploy-staging
deploy-staging: ensure-build deploy-deps
	aws s3 sync --delete ./public/ 's3://rtlong.com-staging/staging/'
