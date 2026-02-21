SHELL := /bin/zsh

.PHONY: check install daml-test daml-start canton-up canton-down

check:
	./scripts/check_env.sh

install:
	./scripts/install_tools.sh

daml-test:
	cd daml && daml test

daml-start:
	cd daml && daml start

canton-up:
	cd infra/canton && docker-compose up -d

canton-down:
	cd infra/canton && docker-compose down
