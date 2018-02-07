.PHONY: build
build: clean hugo

.PHONY: hugo
hugo: gulp
	hugo

.PHONY: gulp
gulp: node_modules
	npm run build

node_modules:
	npm install

.PHONY: clean
clean:
	git clean -fdx public/

.PHONY: deploy-deps
deploy-deps:
	command -v aws > /dev/null 2>&1 || pip install awscli
	aws configure set preview.cloudfront true

./public/index.html: hugo

.PHONY: ensure-build
ensure-build: ./public/index.html

.PHONY: deploy-production
deploy-production: ensure-build deploy-deps
	aws s3 sync --delete ./public/ 's3://rtlong.com/production/'
	aws cloudfront create-invalidation --distribution-id E2TN83NW9MLEUM --paths '/*'

.PHONY: deploy-staging
deploy-staging: ensure-build deploy-deps
	aws s3 sync --delete ./public/ 's3://rtlong.com-staging/staging/'
