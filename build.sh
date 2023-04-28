#!/bin/zsh

mkdir -p layer/bin

GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o layer/bin/faassh main.go
