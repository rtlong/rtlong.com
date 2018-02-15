default: build

.PHONY: build
build: clean node_modules
	npm run build

node_modules: package.json package-lock.json
	npm install

.PHONY: clean
clean:
	git clean -fdx public/ asset-bundles/ data/assets.json

.PHONY: deploy-deps
deploy-deps:
	command -v aws > /dev/null 2>&1 || pip install awscli
	aws configure set preview.cloudfront true

.PHONY: deploy-production
deploy-production: public/index.html deploy-deps
	aws s3 sync --delete ./public/ 's3://rtlong.com/production/'
	aws cloudfront create-invalidation --distribution-id E2TN83NW9MLEUM --paths '/*'

.PHONY: deploy-staging
deploy-staging: public/index.html deploy-deps
	aws s3 sync --delete ./public/ 's3://rtlong.com-staging/staging/'
