.PHONY: build
build: clean hugo webpack

.PHONY: dev
dev: clean
	./script/dev-mode

.PHONY: dev-open
dev-open:
	./script/dev-open

.PHONY: hugo
hugo:
	docker-compose run --rm hugo hugo

.PHONY: webpack
webpack:
	docker-compose run --rm webpack webpack

.PHONY: clean
clean:
	git clean -fdx public/

.PHONY: deploy-deps
deploy-deps:
	command -v aws > /dev/null 2>&1 || pip install awscli
	aws configure set preview.cloudfront true

./public/index.html:
	make hugo webpack

.PHONY: ensure-build
ensure-build: ./public/index.html

.PHONY: deploy-production
deploy-production: ensure-build deploy-deps
	aws s3 sync --delete ./public/ 's3://rtlong.com/production/'
	aws cloudfront create-invalidation --distribution-id E2TN83NW9MLEUM --paths '/*'

.PHONY: deploy-staging
deploy-staging: ensure-build deploy-deps
	aws s3 sync --delete ./public/ 's3://rtlong.com-staging/staging/'
