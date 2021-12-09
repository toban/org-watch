#!make
include .env
export

.PHONY: list, csv, fetch-repos, docker

docker:
	docker-compose build -- askgit

list:
	docker-compose run -- askgit -e REPO=${REPO}

fetch-repos:
	bash main.sh

csv:
	mkdir -p ./org/${ORG_NAME}/
	bash csv.sh > ./org/${ORG_NAME}/output.csv

all: fetch-repos list