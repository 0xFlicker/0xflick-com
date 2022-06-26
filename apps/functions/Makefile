.PHONY: build-RuntimeDependenciesLayer build-lambda-common package
.PHONY: secrets

package: ARTIFACTS_DIR := .layers/ApiLayer
package: 
	mkdir -p $(ARTIFACTS_DIR)
	cp package.json yarn.lock "$(ARTIFACTS_DIR)/"
	yarn --production --cwd "$(ARTIFACTS_DIR)/"
	yarn build
	cp -r lib "$(ARTIFACTS_DIR)/"
	mkdir -p deploy/layers
	zip -rq deploy/layers/ApiLayer.zip .layers/ApiLayer

build-MetadataFunction:
	$(MAKE) build-RuntimeDependenciesLayer
	$(MAKE) build-lambda-common


build-lambda-common:
	yarn build
	cp -r lib "$(ARTIFACTS_DIR)/"

build-RuntimeDependenciesLayer:
	cp package.json yarn.lock "$(ARTIFACTS_DIR)/"
	yarn --production --cwd "$(ARTIFACTS_DIR)/"
	
update-secrets:
	@aws secretsmanager update-secret --secret-id "degen-bot-secrets" --secret-string '$(shell sops --decrypt secrets/degen-bot-secrets.json)'
create-secrets:
	@aws secretsmanager create-secret --name "degen-bot-secrets" --secret-string '$(shell sops --decrypt secrets/degen-bot-secrets.json)'
