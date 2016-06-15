.PHONY: build
build: phenomic-build

clean:
	git clean -fdx -- dist/
# .PHONY: dev
# dev: clean
# 	./script/dev-mode

# .PHONY: dev-open
# dev-open:
# 	./script/dev-open

.PHONY: phenomic-build
phenomic-build:
	phenomic build
	# docker-compose run --rm phenomic build

.PHONY: deploy-deps
deploy-deps:
	command -v aws > /dev/null 2>&1 || pip install awscli
	aws configure set preview.cloudfront true

./dist/index.html:
	make phenomic-build

.PHONY: ensure-build
ensure-build: ./dist/index.html

.PHONY: deploy-production
deploy-production: ensure-build deploy-deps
	aws s3 sync --delete ./dist/ 's3://rtlong.com/production/'
	aws cloudfront create-invalidation --distribution-id E2TN83NW9MLEUM --paths '/*'

.PHONY: deploy-staging
deploy-staging: ensure-build deploy-deps
	aws s3 sync --delete ./dist/ 's3://rtlong.com-staging/staging/'
